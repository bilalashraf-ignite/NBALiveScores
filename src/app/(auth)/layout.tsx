import { AuthHero } from '@/components/auth/auth-hero';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--dark-bg-primary)]">
      {/* Left: Hero Section - hidden on mobile */}
      <div className="hidden lg:block">
        <AuthHero />
      </div>

      {/* Right: Form Section */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[var(--dark-bg-primary)]">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
