import { AccountNav } from "@/components/account-nav";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PageContainer className="py-margin-md">
        <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
          ACCOUNT
        </span>
        <h1 className="text-headline-lg-mobile text-primary sm:text-2xl">Account</h1>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
          <aside className="shrink-0 md:w-44">
            <AccountNav />
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
