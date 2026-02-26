# SWARM Architecture Spec: pdf_aux

## Project Overview
`pdf_aux` is a monorepo for PDF management, featuring a FastAPI backend and a Next.js 16 frontend.

## 1. Repository Structure (Monorepo)
```text
/pdf_aux
  /backend       # FastAPI (Python 3.12+, uv)
  /frontend      # Next.js 16 (App Router, Tailwind 4)
  /shared        # Shared schemas/types (optional)
  /docs          # Technical documentation
  ARCH.md        # This spec
  docker-compose.yaml
```

## 2. Backend Architecture (FastAPI)
- **Runtime:** Python 3.12+ managed by `uv`.
- **Endpoints:**
  - `POST /upload`: Accepts PDF files, stores metadata, and saves to local storage (initial phase).
  - `GET /documents`: Returns a list of uploaded document metadata.
  - `GET /documents/{id}/pdf`: Streams the PDF file for viewing.
- **Standards:** Strict type hinting, Pydantic v2 schemas, `ruff` for linting.

## 3. Frontend Architecture (Next.js 16)
- **Framework:** Next.js 16 App Router (TS Strict).
- **Styling:** Tailwind CSS 4.
- **Components:**
  - `UploadZone`: Drag-and-drop PDF upload.
  - `DocumentList`: Fetches and displays metadata from `/documents`.
  - `PDFViewer`: Uses `react-pdf` to render the file from `/documents/{id}/pdf`.

## 4. Operational Constraints
- **Thermal Management:** `istats` monitoring during builds. Limit concurrency (e.g., `uv pip install --jobs 1`).
- **Builds:** Single-core where possible to maintain < 78C.

## 5. Swarm Lifecycle Status
- **Phase:** ARCH spec (Current)
- **Next:** CODEX implementation (Backend Scaffold)
