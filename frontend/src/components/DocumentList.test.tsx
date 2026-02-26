import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentList } from "./DocumentList";

const originalFetch = global.fetch;

describe("DocumentList", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("loads and renders documents", async () => {
    const onSelect = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          filename: "alpha.pdf",
          content_type: "application/pdf",
          size_bytes: 1024,
          uploaded_at: "2026-01-01T00:00:00Z"
        }
      ]
    } as Response);

    render(<DocumentList refreshKey={0} selectedId={null} onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText("alpha.pdf")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /alpha\.pdf/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
