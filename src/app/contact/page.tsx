// app/contact/page.tsx

import ContactHero from "@/components/section/Contact/ContactHero";
import MapSection from "@/components/section/Contact/MapSection";
import QuickContact from "@/components/section/Contact/QuickContact";
import SocialMedia from "@/components/section/Contact/SocialMedia";
import FAQ from "@/components/section/Home/FAQ";

export default function ContactPage() {
  return (
    <main>
      <ContactHero
        title="Get in"
        highlightedText="Touch"
        description="Have questions about our physics courses? Want to enroll or need assistance? Our team is here to help you every step of the way."
        category="general"
      />
      <QuickContact />
      <MapSection />
      <SocialMedia />
      <FAQ />
    </main>
  );
}
