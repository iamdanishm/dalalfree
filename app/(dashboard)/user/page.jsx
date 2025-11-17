import HeroSearch from "./components/HeroSearch";
import TrustBanner from "./components/TrustBanner";
import CTASection from "./components/CTASection";
import Testimonials from "./components/Testimonials";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import QuickCategories from "./components/QuickCategories";
import FeaturedGrid from "./components/FeaturedGrid";

export default function UserExplore() {
  return (
    <div className="bg-background text-foreground font-sans">
      <HeroSearch />
      <QuickCategories />
      <TrustBanner />
      <FeaturedGrid />
      <CTASection />
      <Testimonials />
    </div>
  );
}
