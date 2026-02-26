import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UploadZone } from "./UploadZone";

const originalFetch = global.fetch;

describe("UploadZone", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("rejects non-pdf uploads", async () => {
    const onUploaded = vi.fn();
    render(<UploadZone onUploaded={onUploaded} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = new File(["hello"], "bad.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [badFile] } });

    expect(await screen.findByText("Only PDF files are supported.")).toBeInTheDocument();
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("uploads PDF and emits callback", async () => {
    const onUploaded = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "abc",
        filename: "doc.pdf",
        content_type: "application/pdf",
        size_bytes: 1234,
        uploaded_at: "2026-01-01T00:00:00Z"
      })
    } as Response);

    render(<UploadZone onUploaded={onUploaded} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = new File(["%PDF-1.7"], "doc.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledTimes(1);
    });
  });
});
