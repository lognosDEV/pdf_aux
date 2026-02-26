import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { PDFViewer } from "./PDFViewer";

vi.mock("react-pdf", () => ({
  pdfjs: {
    version: "test",
    GlobalWorkerOptions: { workerSrc: "" }
  },
  Document: ({ children }: { children: ReactNode }) => <div data-testid="pdf-document">{children}</div>,
  Page: () => <div data-testid="pdf-page">page</div>
}));

describe("PDFViewer", () => {
  it("shows placeholder when no selection", () => {
    render(<PDFViewer document={null} />);
    expect(screen.getByText("Select a document to preview it.")).toBeInTheDocument();
  });

  it("renders download link for selected document", () => {
    render(
      <PDFViewer
        document={{
          id: "doc-1",
          filename: "sample.pdf",
          content_type: "application/pdf",
          size_bytes: 99,
          uploaded_at: "2026-01-01T00:00:00Z"
        }}
      />
    );

    const link = screen.getByRole("link", { name: "Re-download PDF" });
    expect(link).toHaveAttribute("href", "/backend/documents/doc-1/pdf");
    expect(screen.getByTestId("pdf-page")).toBeInTheDocument();
  });
});
