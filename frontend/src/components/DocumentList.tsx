"use client";

import { useEffect, useState } from "react";
import type { DocumentMetadata } from "@/types/documents";

type DocumentListProps = {
  refreshKey: number;
  selectedId: string | null;
  onSelect: (document: DocumentMetadata) => void;
};

export function DocumentList({ refreshKey, selectedId, onSelect }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/backend/documents", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load documents.");
        }

        const data = (await response.json()) as DocumentMetadata[];
        if (isMounted) {
          setDocuments(data);
        }
      } catch (loadError) {
        if (isMounted) {
          const message = loadError instanceof Error ? loadError.message : "Failed to load documents.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDocuments();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return (
    <section className="panel p-6">
      <h2 className="text-lg font-semibold tracking-wide text-zinc-100">Documents</h2>
      {isLoading ? <p className="mt-4 text-sm text-zinc-400">Loading...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {!isLoading && !error && documents.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">No documents uploaded yet.</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {documents.map((document) => {
          const selected = selectedId === document.id;
          return (
            <li key={document.id}>
              <button
                type="button"
                onClick={() => onSelect(document)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "border-zinc-300 bg-zinc-100/10 text-zinc-100"
                    : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                <span className="truncate pr-3">{document.filename}</span>
                <span className="text-xs text-zinc-500">
                  {(document.size_bytes / 1024).toFixed(1)} KB
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
