import FAQ from "@/components/section/Home/FAQ";
import FreeResources from "@/components/section/Home/FreeResources";
import Hero from "@/components/section/Home/Hero";
import KeyBenefits from "@/components/section/Home/KeyBenefits";
import StepsSection from "@/components/section/Home/Steps";
import StudentResults from "@/components/section/Home/StudentResults";
import FinalCTA from "@/components/shared/FainalCTA";

export default function Home() {
  return (
    <div>
      <Hero />
      <KeyBenefits />
      <StepsSection />
      <StudentResults />
      <FreeResources />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
