/** Wildflower Media brand constants (paths, copy). */

export const BRAND = {
  networkName: "wildflower media llc",
  networkNameDisplay: "Wildflower Media",
  tagline: "Precision in Podcasting.",
  missionQuote:
    "We believe in high-fidelity conversations and accurate cultural analysis. Wildflower isn't just a network; it's a commitment to the art of the audio narrative.",
  merchSectionTitle: "Wildflower Goods",
  merchSectionEyebrow: "OFFICIAL GEAR",
} as const;

export const BRAND_ASSETS = {
  wildflowerLockup: "/brand/wildflower-lockup.png",
  tmsRecord: "/brand/tms-record.png",
  sofLogo: "/brand/sof-logo.png",
} as const;

export function copyrightYear(): number {
  return new Date().getFullYear();
}
