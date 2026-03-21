export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check is handled by middleware - no need for redirect here
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
