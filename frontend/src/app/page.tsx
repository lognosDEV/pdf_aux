"use client";

import { useState } from "react";
import { DocumentList } from "@/components/DocumentList";
import { PDFViewer } from "@/components/PDFViewer";
import { UploadZone } from "@/components/UploadZone";
import type { DocumentMetadata } from "@/types/documents";

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);

  const handleUploaded = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setRefreshKey((current) => current + 1);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">pdf_aux</p>
        <h1 className="text-2xl font-semibold text-zinc-100 md:text-3xl">PDF Workspace</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <UploadZone onUploaded={handleUploaded} />
          <DocumentList
            refreshKey={refreshKey}
            selectedId={selectedDocument?.id ?? null}
            onSelect={setSelectedDocument}
          />
        </div>
        <PDFViewer document={selectedDocument} />
      </section>
    </main>
  );
}
