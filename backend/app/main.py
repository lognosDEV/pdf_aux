from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
STORAGE_DIR = BACKEND_DIR / "storage"

app = FastAPI(title="pdf_aux Backend", version="0.1.0")


class DocumentMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    filename: str
    content_type: str
    size_bytes: int
    uploaded_at: datetime


def _metadata_path(document_id: str) -> Path:
    return STORAGE_DIR / f"{document_id}.json"


def _pdf_path(document_id: str) -> Path:
    return STORAGE_DIR / f"{document_id}.pdf"


def _load_metadata(document_id: str) -> DocumentMetadata:
    metadata_file = _metadata_path(document_id)
    if not metadata_file.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    try:
        metadata_raw = json.loads(metadata_file.read_text(encoding="utf-8"))
        return DocumentMetadata.model_validate(metadata_raw)
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored metadata is invalid.",
        ) from exc


def _ensure_storage() -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def _validate_pdf_header(content: bytes) -> None:
    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file does not look like a valid PDF.",
        )


@app.post("/upload", response_model=DocumentMetadata, status_code=status.HTTP_201_CREATED)
async def upload_pdf(file: UploadFile = File(...)) -> DocumentMetadata:
    _ensure_storage()

    filename = Path(file.filename or "").name
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )

    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF uploads are supported.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    _validate_pdf_header(content)

    document_id = uuid4().hex
    uploaded_at = datetime.now(UTC)
    metadata = DocumentMetadata(
        id=document_id,
        filename=filename,
        content_type="application/pdf",
        size_bytes=len(content),
        uploaded_at=uploaded_at,
    )

    pdf_file = _pdf_path(document_id)
    metadata_file = _metadata_path(document_id)

    try:
        pdf_file.write_bytes(content)
        metadata_file.write_text(metadata.model_dump_json(indent=2), encoding="utf-8")
    except OSError as exc:
        if pdf_file.exists():
            pdf_file.unlink(missing_ok=True)
        if metadata_file.exists():
            metadata_file.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store uploaded file.",
        ) from exc
    finally:
        await file.close()

    return metadata


@app.get("/documents", response_model=list[DocumentMetadata])
def list_documents() -> list[DocumentMetadata]:
    _ensure_storage()
    documents: list[DocumentMetadata] = []

    for metadata_file in sorted(STORAGE_DIR.glob("*.json")):
        try:
            metadata_raw = json.loads(metadata_file.read_text(encoding="utf-8"))
            documents.append(DocumentMetadata.model_validate(metadata_raw))
        except (json.JSONDecodeError, ValueError):
            continue

    documents.sort(key=lambda item: item.uploaded_at, reverse=True)
    return documents


@app.get("/documents/{document_id}/pdf")
def stream_pdf(document_id: str) -> FileResponse:
    metadata = _load_metadata(document_id)
    pdf_file = _pdf_path(document_id)
    if not pdf_file.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    return FileResponse(
        path=pdf_file,
        media_type="application/pdf",
        filename=metadata.filename,
    )

