import { renderHook, waitFor, act } from "@testing-library/react";
import { useStarPointCheckout } from "@/hooks/use-star-point-checkout";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("useStarPointCheckout hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return initial state (not loading)", () => {
    const { result } = renderHook(() => useStarPointCheckout());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should call checkout API with correct parameters", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        purchaseId: "purchase_123",
        checkoutUrl: "https://checkout.stripe.test/session_123",
      }),
    });

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/wallet/checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productCode: "star_500" }),
    });
  });

  it("should return checkout session response on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        purchaseId: "purchase_123",
        checkoutUrl: "https://checkout.stripe.test/session_123",
      }),
    });

    const { result } = renderHook(() => useStarPointCheckout());

    let response;
    await act(async () => {
      response = await result.current.createCheckout("star_500");
    });

    expect(response).toEqual({
      purchaseId: "purchase_123",
      checkoutUrl: "https://checkout.stripe.test/session_123",
    });
  });

  it("should set loading state during checkout", async () => {
    let resolvePromise: (value: unknown) => void;
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useStarPointCheckout());

    // Start checkout but don't await
    act(() => {
      result.current.createCheckout("star_500");
    });

    // Should be loading now
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ purchaseId: "p1", checkoutUrl: "http://test" }),
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should reset loading to false after success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        purchaseId: "purchase_123",
        checkoutUrl: "https://checkout.stripe.test/session_123",
      }),
    });

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should handle 401 unauthorized error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(result.current.error).toBe("Please sign in to purchase");
  });

  it("should handle 400 invalid product error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("invalid_product");
    });

    expect(result.current.error).toBe("Invalid product selected");
  });

  it("should handle 403 forbidden error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(result.current.error).toBe("Account access restricted");
  });

  it("should handle generic fetch failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(result.current.error).toBe("Failed to create checkout session");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(result.current.error).toBe("Network error");
  });

  it("should return null on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useStarPointCheckout());

    let response;
    await act(async () => {
      response = await result.current.createCheckout("star_500");
    });

    expect(response).toBeNull();
  });

  it("should clear previous error on new checkout attempt", async () => {
    // First call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useStarPointCheckout());

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(result.current.error).toBe("Please sign in to purchase");

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        purchaseId: "purchase_456",
        checkoutUrl: "https://checkout.stripe.test/session_456",
      }),
    });

    await act(async () => {
      await result.current.createCheckout("star_500");
    });

    expect(result.current.error).toBeNull();
  });
});
