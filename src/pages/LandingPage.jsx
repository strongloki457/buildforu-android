import LandingCta from "../components/landing/LandingCta";
import LandingFeatureGrid from "../components/landing/LandingFeatureGrid";
import LandingHero from "../components/landing/LandingHero";
import PublicShell from "../components/marketing/PublicShell";

export default function LandingPage() {
  return (
    <PublicShell>
      <LandingHero />
      <LandingFeatureGrid />
      <LandingCta />
    </PublicShell>
  );
}
