import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WalletSection } from "@/components/wallet-section";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock the hooks
jest.mock("@/hooks/use-wallet-balance", () => ({
  useWalletBalance: jest.fn(),
}));

jest.mock("@/hooks/use-wallet-ledger", () => ({
  useWalletLedger: jest.fn(),
}));

jest.mock("@/hooks/use-star-point-checkout", () => ({
  useStarPointCheckout: jest.fn(),
}));

import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useWalletLedger } from "@/hooks/use-wallet-ledger";
import { useStarPointCheckout } from "@/hooks/use-star-point-checkout";

describe("WalletSection", () => {
  const mockRefreshBalance = jest.fn();
  const mockRefreshLedger = jest.fn();
  const mockCreateCheckout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: { balance: 500, pendingPurchases: 0 },
      isLoading: false,
      error: null,
      refreshBalance: mockRefreshBalance,
    });

    (useWalletLedger as jest.Mock).mockReturnValue({
      entries: [],
      isLoading: false,
      error: null,
      refreshLedger: mockRefreshLedger,
    });

    (useStarPointCheckout as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      createCheckout: mockCreateCheckout,
    });
  });

  describe("Loading State", () => {
    it("shows loading skeleton when balance is loading", () => {
      (useWalletBalance as jest.Mock).mockReturnValue({
        balance: null,
        isLoading: true,
        error: null,
        refreshBalance: mockRefreshBalance,
      });

      const { container } = render(<WalletSection />);

      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("shows error message when balance fetch fails", () => {
      (useWalletBalance as jest.Mock).mockReturnValue({
        balance: null,
        isLoading: false,
        error: "Failed to load balance",
        refreshBalance: mockRefreshBalance,
      });

      render(<WalletSection />);

      expect(screen.getByText("Failed to load balance")).toBeInTheDocument();
    });

    it("shows checkout error message", () => {
      (useStarPointCheckout as jest.Mock).mockReturnValue({
        isLoading: false,
        error: "Checkout failed",
        createCheckout: mockCreateCheckout,
      });

      render(<WalletSection />);

      expect(screen.getByText("Checkout failed")).toBeInTheDocument();
    });

    it("shows ledger error message", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [],
        isLoading: false,
        error: "Failed to load transactions",
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      expect(screen.getByText("Failed to load transactions")).toBeInTheDocument();
    });
  });

  describe("Balance Display", () => {
    it("displays the section title", () => {
      render(<WalletSection />);

      expect(screen.getByText("Star Points Wallet")).toBeInTheDocument();
    });

    it("displays current balance with star icon", () => {
      render(<WalletSection />);

      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("★")).toBeInTheDocument();
    });

    it("displays zero balance when balance is 0", () => {
      (useWalletBalance as jest.Mock).mockReturnValue({
        balance: { balance: 0, pendingPurchases: 0 },
        isLoading: false,
        error: null,
        refreshBalance: mockRefreshBalance,
      });

      render(<WalletSection />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("shows pending purchases count when present", () => {
      (useWalletBalance as jest.Mock).mockReturnValue({
        balance: { balance: 500, pendingPurchases: 2 },
        isLoading: false,
        error: null,
        refreshBalance: mockRefreshBalance,
      });

      render(<WalletSection />);

      expect(screen.getByText(/2 pending transaction/)).toBeInTheDocument();
    });

    it("does not show pending purchases when count is 0", () => {
      render(<WalletSection />);

      expect(screen.queryByText(/pending transaction/)).not.toBeInTheDocument();
    });

    it("calls refreshBalance when refresh button clicked", () => {
      render(<WalletSection />);

      fireEvent.click(screen.getByLabelText("Refresh balance"));

      expect(mockRefreshBalance).toHaveBeenCalled();
    });
  });

  describe("Purchase Packages", () => {
    it("displays purchase section title", () => {
      render(<WalletSection />);

      expect(screen.getByText("Purchase Star Points")).toBeInTheDocument();
    });

    it("displays all three star point packages", () => {
      render(<WalletSection />);

      expect(screen.getByText("100 ★")).toBeInTheDocument();
      expect(screen.getByText("500 ★")).toBeInTheDocument();
      expect(screen.getByText("1,000 ★")).toBeInTheDocument();
    });

    it("displays correct prices for packages", () => {
      render(<WalletSection />);

      expect(screen.getByText("$4.99")).toBeInTheDocument();
      expect(screen.getByText("$19.99")).toBeInTheDocument();
      expect(screen.getByText("$34.99")).toBeInTheDocument();
    });

    it("calls createCheckout with correct product code when 100 points clicked", async () => {
      render(<WalletSection />);

      fireEvent.click(screen.getByText("100 ★").closest("button")!);

      await waitFor(() => {
        expect(mockCreateCheckout).toHaveBeenCalledWith("star_100");
      });
    });

    it("calls createCheckout with correct product code when 500 points clicked", async () => {
      render(<WalletSection />);

      fireEvent.click(screen.getByText("500 ★").closest("button")!);

      await waitFor(() => {
        expect(mockCreateCheckout).toHaveBeenCalledWith("star_500");
      });
    });

    it("calls createCheckout with correct product code when 1000 points clicked", async () => {
      render(<WalletSection />);

      fireEvent.click(screen.getByText("1,000 ★").closest("button")!);

      await waitFor(() => {
        expect(mockCreateCheckout).toHaveBeenCalledWith("star_1000");
      });
    });

    it("disables buttons during checkout", () => {
      (useStarPointCheckout as jest.Mock).mockReturnValue({
        isLoading: true,
        error: null,
        createCheckout: mockCreateCheckout,
      });

      render(<WalletSection />);

      const buttons = screen.getAllByRole("button").filter((btn) =>
        btn.textContent?.includes("★")
      );
      buttons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe("Transaction History", () => {
    it("displays transactions section title", () => {
      render(<WalletSection />);

      expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
    });

    it("shows 'No transactions yet' when entries is empty", () => {
      render(<WalletSection />);

      expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    });

    it("displays recent transactions", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [
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
          {
            id: "entry_2",
            userId: "user_123",
            purchaseId: null,
            entryType: "DEBIT_SPEND",
            pointsDelta: -100,
            reason: "Used for premium feature",
            metadata: null,
            createdAt: "2026-03-15T10:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      expect(screen.getByText("Purchased star_500")).toBeInTheDocument();
      expect(screen.getByText("Used for premium feature")).toBeInTheDocument();
      expect(screen.getByText("+500 ★")).toBeInTheDocument();
      expect(screen.getByText("-100 ★")).toBeInTheDocument();
    });

    it("shows only first 5 transactions", () => {
      const entries = Array.from({ length: 8 }, (_, i) => ({
        id: `entry_${i}`,
        userId: "user_123",
        purchaseId: null,
        entryType: "CREDIT_PURCHASE" as const,
        pointsDelta: 100,
        reason: `Transaction ${i}`,
        metadata: null,
        createdAt: "2026-03-16T12:00:00.000Z",
      }));

      (useWalletLedger as jest.Mock).mockReturnValue({
        entries,
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      // Should show transactions 0-4
      expect(screen.getByText("Transaction 0")).toBeInTheDocument();
      expect(screen.getByText("Transaction 4")).toBeInTheDocument();
      expect(screen.queryByText("Transaction 5")).not.toBeInTheDocument();
    });

    it("shows 'View all' link when more than 5 transactions", () => {
      const entries = Array.from({ length: 8 }, (_, i) => ({
        id: `entry_${i}`,
        userId: "user_123",
        purchaseId: null,
        entryType: "CREDIT_PURCHASE" as const,
        pointsDelta: 100,
        reason: `Transaction ${i}`,
        metadata: null,
        createdAt: "2026-03-16T12:00:00.000Z",
      }));

      (useWalletLedger as jest.Mock).mockReturnValue({
        entries,
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      expect(screen.getByText("View all")).toBeInTheDocument();
      expect(screen.getByText("View all")).toHaveAttribute("href", "/wallet/history");
    });

    it("does not show 'View all' link when 5 or fewer transactions", () => {
      const entries = [
        {
          id: "entry_1",
          userId: "user_123",
          purchaseId: null,
          entryType: "CREDIT_PURCHASE" as const,
          pointsDelta: 100,
          reason: "Transaction 1",
          metadata: null,
          createdAt: "2026-03-16T12:00:00.000Z",
        },
      ];

      (useWalletLedger as jest.Mock).mockReturnValue({
        entries,
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      expect(screen.queryByText("View all")).not.toBeInTheDocument();
    });

    it("shows loading skeleton for transactions when ledger is loading", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [],
        isLoading: true,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      const { container } = render(<WalletSection />);

      // Should have multiple skeletons for transactions (balance is loaded, ledger is loading)
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Entry Type Labels", () => {
    it("displays correct label for CREDIT_PURCHASE", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [
          {
            id: "entry_1",
            userId: "user_123",
            purchaseId: null,
            entryType: "CREDIT_PURCHASE",
            pointsDelta: 100,
            reason: "Test item",
            metadata: null,
            createdAt: "2026-03-16T12:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      // "Purchase · Mar 16, 2026" in the transaction detail
      expect(screen.getByText(/Purchase · /)).toBeInTheDocument();
    });

    it("displays correct label for DEBIT_REFUND", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [
          {
            id: "entry_1",
            userId: "user_123",
            purchaseId: null,
            entryType: "DEBIT_REFUND",
            pointsDelta: -100,
            reason: "Test item",
            metadata: null,
            createdAt: "2026-03-16T12:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      expect(screen.getByText(/Refund · /)).toBeInTheDocument();
    });

    it("displays correct label for DEBIT_SPEND", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [
          {
            id: "entry_1",
            userId: "user_123",
            purchaseId: null,
            entryType: "DEBIT_SPEND",
            pointsDelta: -50,
            reason: "Test item",
            metadata: null,
            createdAt: "2026-03-16T12:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      expect(screen.getByText(/Spent · /)).toBeInTheDocument();
    });

    it("displays correct label for CREDIT_ADJUSTMENT", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [
          {
            id: "entry_1",
            userId: "user_123",
            purchaseId: null,
            entryType: "CREDIT_ADJUSTMENT",
            pointsDelta: 50,
            reason: "Admin Credit",
            metadata: null,
            createdAt: "2026-03-16T12:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      // Check for the entry type label "Bonus" in the transaction entry
      expect(screen.getByText(/Bonus · /)).toBeInTheDocument();
    });
  });

  describe("Point Delta Styling", () => {
    it("displays positive delta in green", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [
          {
            id: "entry_1",
            userId: "user_123",
            purchaseId: null,
            entryType: "CREDIT_PURCHASE",
            pointsDelta: 500,
            reason: "Test",
            metadata: null,
            createdAt: "2026-03-16T12:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      const deltaElement = screen.getByText("+500 ★");
      expect(deltaElement.className).toContain("text-green");
    });

    it("displays negative delta in red", () => {
      (useWalletLedger as jest.Mock).mockReturnValue({
        entries: [
          {
            id: "entry_1",
            userId: "user_123",
            purchaseId: null,
            entryType: "DEBIT_SPEND",
            pointsDelta: -100,
            reason: "Test",
            metadata: null,
            createdAt: "2026-03-16T12:00:00.000Z",
          },
        ],
        isLoading: false,
        error: null,
        refreshLedger: mockRefreshLedger,
      });

      render(<WalletSection />);

      const deltaElement = screen.getByText("-100 ★");
      expect(deltaElement.className).toContain("text-red");
    });
  });
});
