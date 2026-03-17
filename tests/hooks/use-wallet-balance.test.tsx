import { renderHook, waitFor, act } from "@testing-library/react";
import { useWalletBalance } from "@/hooks/use-wallet-balance";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("useWalletBalance hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return initial loading state", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useWalletBalance());

    expect(result.current.balance).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should fetch balance from /api/star-points/balance", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ balance: 500, pendingPurchases: 1 }),
    });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/star-points/balance");
    expect(result.current.balance).toEqual({ balance: 500, pendingPurchases: 1 });
    expect(result.current.error).toBeNull();
  });

  it("should handle 401 unauthorized error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Please sign in to view your balance");
    expect(result.current.balance).toBeNull();
  });

  it("should handle 403 forbidden error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Account access restricted");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useWalletBalance());

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

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch balance");
  });

  it("should refresh balance when refreshBalance is called", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ balance: 500, pendingPurchases: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ balance: 1000, pendingPurchases: 0 }),
      });

    const { result } = renderHook(() => useWalletBalance());

    await waitFor(() => {
      expect(result.current.balance?.balance).toBe(500);
    });

    await act(async () => {
      await result.current.refreshBalance();
    });

    expect(result.current.balance?.balance).toBe(1000);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
