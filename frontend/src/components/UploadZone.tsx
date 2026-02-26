"use client";

import { useRef, useState } from "react";
import type { ChangeEventHandler, DragEventHandler } from "react";
import type { DocumentMetadata } from "@/types/documents";

type UploadZoneProps = {
  onUploaded: (document: DocumentMetadata) => void;
};

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/backend/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const fallback = "Upload failed.";
        const details = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(details?.detail ?? fallback);
      }

      const uploaded = (await response.json()) as DocumentMetadata;
      onUploaded(uploaded);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop: DragEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files.item(0);
    if (!file) {
      return;
    }
    await uploadFile(file);
  };

  const onInputChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.item(0);
    if (!file) {
      return;
    }

    await uploadFile(file);
    event.currentTarget.value = "";
  };

  return (
    <section className="panel p-6">
      <h2 className="text-lg font-semibold tracking-wide text-zinc-100">Upload PDF</h2>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={onDrop}
        className={`mt-4 flex w-full items-center justify-center rounded-xl border border-dashed px-4 py-10 text-sm transition ${
          isDragging
            ? "border-sky-400 bg-sky-400/10 text-sky-200"
            : "border-zinc-700 bg-zinc-900/55 text-zinc-300 hover:border-zinc-500"
        } ${isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Drop a PDF here or click to select"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={onInputChange}
        className="hidden"
      />
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </section>
  );
}
