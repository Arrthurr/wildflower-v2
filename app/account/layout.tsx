import { AccountNav } from "@/components/account-nav";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
        <aside className="shrink-0 md:w-44">
          <AccountNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
