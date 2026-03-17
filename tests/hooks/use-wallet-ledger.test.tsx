import { renderHook, waitFor, act } from "@testing-library/react";
import { useWalletLedger } from "@/hooks/use-wallet-ledger";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("useWalletLedger hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return initial loading state", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useWalletLedger());

    expect(result.current.entries).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should fetch ledger entries from /api/star-points/ledger", async () => {
    const mockEntries = [
      {
        id: "entry_1",
        userId: "user_123",
        purchaseId: "purchase_1",
        entryType: "CREDIT_PURCHASE",
        pointsDelta: 500,
        reason: "Purchased star_500",
        metadata: null,
        createdAt: "2026-03-16T12:00:00.000Z",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockEntries }),
    });

    const { result } = renderHook(() => useWalletLedger());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/star-points/ledger");
    expect(result.current.entries).toEqual(mockEntries);
    expect(result.current.error).toBeNull();
  });

  it("should handle 401 unauthorized error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useWalletLedger());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Please sign in to view transactions");
    expect(result.current.entries).toEqual([]);
  });

  it("should handle 403 forbidden error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const { result } = renderHook(() => useWalletLedger());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Account access restricted");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useWalletLedger());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });

  it("should handle generic fetch failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useWalletLedger());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch transactions");
  });

  it("should refresh ledger when refreshLedger is called", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "entry_1",
              entryType: "CREDIT_PURCHASE",
              pointsDelta: 100,
              reason: "Test",
              createdAt: "2026-03-16T12:00:00.000Z",
            },
          ],
        }),
      });

    const { result } = renderHook(() => useWalletLedger());

    await waitFor(() => {
      expect(result.current.entries).toEqual([]);
    });

    await act(async () => {
      await result.current.refreshLedger();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
