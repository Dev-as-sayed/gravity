// app/contact/page.tsx

import ContactHero from "@/components/section/Contact/ContactHero";

export default function ContactPage() {
  return (
    <main>
      <ContactHero
        title="Get in"
        highlightedText="Touch"
        description="Have questions about our physics courses? Want to enroll or need assistance? Our team is here to help you every step of the way."
        category="general"
      />
      {/* Rest of your contact page content */}
    </main>
  );
}
