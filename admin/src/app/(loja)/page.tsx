import Hero from "@/components/home/Hero";
import Collection from "@/components/home/Collection";
import Story from "@/components/home/Story";
import BestSellers from "@/components/home/BestSellers";
import Testimonials from "@/components/home/Testimonials";
import TrustBar from "@/components/home/TrustBar";
import Newsletter from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Collection />
      <Story />
      <BestSellers />
      <Testimonials />
      <TrustBar />
      <Newsletter />
    </>
  );
}
