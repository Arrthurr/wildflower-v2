import { MaterialIcon } from "@/components/ui/material-icon";
import { BRAND } from "@/lib/brand";
import { PageContainer } from "@/components/layout/page-container";

export function MissionSection() {
  return (
    <section className="border-y border-outline-variant bg-surface-bright py-24">
      <PageContainer className="text-center">
        <div className="mx-auto max-w-3xl">
          <MaterialIcon name="mic" className="mb-8 text-4xl text-tms-orange" />
          <h2 className="mb-8 text-[2.5rem] leading-tight text-sof-navy md:text-[3.5rem]">
            {BRAND.tagline}
          </h2>
          <p className="font-editorial text-editorial-body italic text-on-surface-variant">
            &ldquo;{BRAND.missionQuote}&rdquo;
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
