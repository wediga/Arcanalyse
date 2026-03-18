import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Features from "@/components/landing/Features";
import Signup from "@/components/landing/Signup";
import Footer from "@/components/landing/Footer";
import OrnamentDivider from "@/components/landing/OrnamentDivider";

export default function Home() {
  return (
    <main>
      <Hero />
      <OrnamentDivider />
      <Problem />
      <OrnamentDivider />
      <Solution />
      <OrnamentDivider />
      <Features />
      <OrnamentDivider />
      <Signup />
      <Footer />
    </main>
  );
}
