import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// Mock useProfile
jest.mock("@/hooks/use-profile", () => ({
  useProfile: jest.fn(),
}));

// Mock wallet hooks
jest.mock("@/hooks/use-wallet-balance", () => ({
  useWalletBalance: jest.fn(),
}));

jest.mock("@/hooks/use-wallet-ledger", () => ({
  useWalletLedger: jest.fn(),
}));

jest.mock("@/hooks/use-star-point-checkout", () => ({
  useStarPointCheckout: jest.fn(),
}));

// Mock profile components
jest.mock("@/components/profile-form", () => ({
  ProfileForm: () => <div data-testid="profile-form">Profile Form</div>,
}));

jest.mock("@/components/avatar-upload", () => ({
  AvatarUpload: () => <div data-testid="avatar-upload">Avatar Upload</div>,
}));

jest.mock("@/components/linked-accounts", () => ({
  LinkedAccounts: () => <div data-testid="linked-accounts">Linked Accounts</div>,
}));

jest.mock("@/components/password-section", () => ({
  PasswordSection: () => <div data-testid="password-section">Password Section</div>,
}));

jest.mock("@/components/email-verification", () => ({
  EmailVerification: () => <div data-testid="email-verification">Email Verification</div>,
}));

import { useProfile } from "@/hooks/use-profile";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useWalletLedger } from "@/hooks/use-wallet-ledger";
import { useStarPointCheckout } from "@/hooks/use-star-point-checkout";

describe("Profile Page with Wallet Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useProfile as jest.Mock).mockReturnValue({
      profile: {
        id: "user_123",
        name: "John Doe",
        email: "john@example.com",
        emailVerified: new Date(),
        image: null,
        phone: null,
        bio: null,
        location: null,
        birthday: null,
        gender: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      refreshProfile: jest.fn(),
    });

    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: { balance: 1500, pendingPurchases: 0 },
      isLoading: false,
      error: null,
      refreshBalance: jest.fn(),
    });

    (useWalletLedger as jest.Mock).mockReturnValue({
      entries: [
        {
          id: "entry_1",
          userId: "user_123",
          purchaseId: "purchase_1",
          entryType: "CREDIT_PURCHASE",
          pointsDelta: 1000,
          reason: "Purchased star_1000",
          metadata: null,
          createdAt: "2026-03-16T12:00:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
      refreshLedger: jest.fn(),
    });

    (useStarPointCheckout as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      createCheckout: jest.fn(),
    });
  });

  it("renders profile page with all sections including wallet", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      // Check profile sections are present
      expect(screen.getByTestId("avatar-upload")).toBeInTheDocument();
      expect(screen.getByTestId("profile-form")).toBeInTheDocument();
      expect(screen.getByTestId("linked-accounts")).toBeInTheDocument();
      expect(screen.getByTestId("password-section")).toBeInTheDocument();

      // Check wallet section is present
      expect(screen.getByText("Star Points Wallet")).toBeInTheDocument();
    });
  });

  it("displays wallet balance on profile page", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("1,500")).toBeInTheDocument();
    });
  });

  it("displays all purchase packages on profile page", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("$4.99")).toBeInTheDocument();
      expect(screen.getByText("$19.99")).toBeInTheDocument();
      expect(screen.getByText("$34.99")).toBeInTheDocument();
    });
  });

  it("displays transaction history on profile page", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Purchased star_1000")).toBeInTheDocument();
      expect(screen.getByText("+1,000 ★")).toBeInTheDocument();
    });
  });

  it("shows loading state while profile is loading", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: null,
      isLoading: true,
      error: null,
      updateProfile: jest.fn(),
      refreshProfile: jest.fn(),
    });

    const { container } = render(<ProfilePage />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error state when profile fails to load", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: null,
      isLoading: false,
      error: "Failed to load profile",
      updateProfile: jest.fn(),
      refreshProfile: jest.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByText("Error loading profile")).toBeInTheDocument();
  });

  it("renders nothing when profile is null and not loading", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: null,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      refreshProfile: jest.fn(),
    });

    const { container } = render(<ProfilePage />);

    expect(container.firstChild).toBeNull();
  });

  it("shows wallet loading skeleton when wallet is loading", async () => {
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: null,
      isLoading: true,
      error: null,
      refreshBalance: jest.fn(),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      // Profile sections should render
      expect(screen.getByTestId("avatar-upload")).toBeInTheDocument();
      // Wallet should show loading (animate-pulse)
      const animatedElements = document.querySelectorAll(".animate-pulse");
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  it("shows wallet error when balance fetch fails", async () => {
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: null,
      isLoading: false,
      error: "Please sign in to view your balance",
      refreshBalance: jest.fn(),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Please sign in to view your balance")).toBeInTheDocument();
    });
  });

  it("shows no transactions message when ledger is empty", async () => {
    (useWalletLedger as jest.Mock).mockReturnValue({
      entries: [],
      isLoading: false,
      error: null,
      refreshLedger: jest.fn(),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    });
  });

  it("shows pending purchases count when present", async () => {
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: { balance: 500, pendingPurchases: 3 },
      isLoading: false,
      error: null,
      refreshBalance: jest.fn(),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/3 pending transaction/)).toBeInTheDocument();
    });
  });
});
