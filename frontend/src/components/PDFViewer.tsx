"use client";

import { Document, Page, pdfjs } from "react-pdf";
import type { DocumentMetadata } from "@/types/documents";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PDFViewerProps = {
  document: DocumentMetadata | null;
};

export function PDFViewer({ document }: PDFViewerProps) {
  if (!document) {
    return (
      <section className="panel flex min-h-[520px] items-center justify-center p-6">
        <p className="text-sm text-zinc-400">Select a document to preview it.</p>
      </section>
    );
  }

  const pdfUrl = `/backend/documents/${document.id}/pdf`;

  return (
    <section className="panel p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="truncate text-lg font-semibold tracking-wide text-zinc-100">{document.filename}</h2>
        <a
          href={pdfUrl}
          download={document.filename}
          className="rounded-lg border border-sky-300/70 bg-sky-300/15 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/25"
        >
          Re-download PDF
        </a>
      </div>
      <div className="max-h-[70vh] overflow-auto rounded-lg border border-zinc-700 bg-black/35 p-4">
        <Document file={pdfUrl} loading={<p className="text-sm text-zinc-400">Loading PDF...</p>}>
          <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>
    </section>
  );
}
