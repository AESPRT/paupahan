import { Navbar } from "@/src/components/landing/Navbar";
import { Hero } from "@/src/components/landing/Hero";
import { PainPoints } from "@/src/components/landing/PainPoints";
import { Features } from "@/src/components/landing/Features";
import { HowItWorks } from "@/src/components/landing/HowItWorks";
import { Pricing } from "@/src/components/landing/Pricing";
import { Faq } from "@/src/components/landing/Faq";
import { CtaBand } from "@/src/components/landing/CtaBand";
import { Footer } from "@/src/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
