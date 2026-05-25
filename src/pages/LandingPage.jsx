import LandingAiSection from "../components/landing/LandingAiSection";
import LandingCta from "../components/landing/LandingCta";
import LandingFeatureGrid from "../components/landing/LandingFeatureGrid";
import LandingHero from "../components/landing/LandingHero";
import LandingHowItWorks from "../components/landing/LandingHowItWorks";
import PublicShell from "../components/marketing/PublicShell";

export default function LandingPage() {
  return (
    <PublicShell>
      <LandingHero />
      <LandingHowItWorks />
      <LandingFeatureGrid />
      <LandingAiSection />
      <LandingCta />
    </PublicShell>
  );
}
