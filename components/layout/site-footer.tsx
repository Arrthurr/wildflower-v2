import Image from "next/image";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { BRAND, BRAND_ASSETS, copyrightYear } from "@/lib/brand";
import { FLAGSHIP_SHOW } from "@/lib/shows";
import { PageContainer } from "./page-container";

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-low transition-colors">
      <PageContainer className="flex flex-col items-center justify-between gap-gutter py-12 lg:flex-row lg:items-center">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <Image
            src={BRAND_ASSETS.wildflowerLockup}
            alt={BRAND.networkNameDisplay}
            width={160}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <p className="text-center text-label-caps text-on-surface-variant lg:text-left">
            © {copyrightYear()} {BRAND.networkName}. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-margin-md">
          <Link
            href="#"
            className="text-label-caps text-on-surface-variant transition-colors hover:text-deep-orange"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-label-caps text-on-surface-variant transition-colors hover:text-deep-orange"
          >
            Terms of Service
          </Link>
          <Link
            href="/sponsor"
            className="text-label-caps text-on-surface-variant transition-colors hover:text-deep-orange"
          >
            Contact
          </Link>
          <Link
            href="/about"
            className="text-label-caps text-on-surface-variant transition-colors hover:text-deep-orange"
          >
            About
          </Link>
        </div>
        <div className="flex gap-4">
          <a
            href={FLAGSHIP_SHOW.defaultRssUrl}
            className="flex size-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:bg-tms-orange hover:text-white"
            aria-label="RSS feed"
          >
            <MaterialIcon name="rss_feed" className="text-lg" />
          </a>
          <Link
            href="/sponsor"
            className="flex size-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:bg-tms-orange hover:text-white"
            aria-label="Contact"
          >
            <MaterialIcon name="alternate_email" className="text-lg" />
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}
