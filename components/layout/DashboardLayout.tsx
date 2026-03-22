export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-14" style={{ backgroundColor: "#0a0b0f" }}>
      {children}
    </div>
  );
}
