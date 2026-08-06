import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Materials from "@/components/Materials";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F6F4EB]">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Materials />
      <Footer />
    </main>
  );
}