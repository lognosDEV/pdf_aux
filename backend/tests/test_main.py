from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

import app.main as main_module


def _pdf_bytes() -> bytes:
    return b"%PDF-1.7\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"


def test_upload_and_list_documents(tmp_path: Path) -> None:
    main_module.STORAGE_DIR = tmp_path / "storage"
    client = TestClient(main_module.app)

    response = client.post(
        "/upload",
        files={"file": ("sample.pdf", _pdf_bytes(), "application/pdf")},
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["filename"] == "sample.pdf"
    assert (main_module.STORAGE_DIR / f"{payload['id']}.pdf").exists()
    assert (main_module.STORAGE_DIR / f"{payload['id']}.json").exists()

    list_response = client.get("/documents")
    assert list_response.status_code == 200
    documents = list_response.json()
    assert len(documents) == 1
    assert documents[0]["id"] == payload["id"]


def test_upload_rejects_non_pdf(tmp_path: Path) -> None:
    main_module.STORAGE_DIR = tmp_path / "storage"
    client = TestClient(main_module.app)

    response = client.post(
        "/upload",
        files={"file": ("sample.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400


def test_stream_pdf_not_found(tmp_path: Path) -> None:
    main_module.STORAGE_DIR = tmp_path / "storage"
    client = TestClient(main_module.app)

    response = client.get("/documents/missing/pdf")
    assert response.status_code == 404

