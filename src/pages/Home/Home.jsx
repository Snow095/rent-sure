import FeaturedProperties from "../../components/FeaturedProperties/FeaturedProperties";
import FinalCTA from "../../components/FinalCTA/FinalCTA";
import Hero from "../../components/Hero/Hero";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import SafetyTips from "../../components/SafetyTips/SafetyTips";
import WhyRentSure from "../../components/WhyRentSure/WhyRentSure";
import Footer from "../../components/Footer/Footer";

const Home = () => {
  return (
    <main>
      <Hero />
      <WhyRentSure/>
      <FeaturedProperties/>
      <HowItWorks/>
      <SafetyTips/>
      <FinalCTA/>
      <Footer/>
    </main>
  );
}

export default Home;

