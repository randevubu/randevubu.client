import {
  Navbar,
  Footer,
  Hero,
  HowItWorks,
  Features,
  Pricing,
  RecommendedBusinesses,
  AnimatedSection,
} from '../components';
import MobileBottomNav from '../components/layout/MobileBottomNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--theme-background)] transition-colors duration-300">
      <Navbar />
      <Hero />
      <AnimatedSection direction="up" delay={0.1}>
        <RecommendedBusinesses />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.15}>
        <Features />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.2}>
        <HowItWorks />
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.25}>
        <Pricing />
      </AnimatedSection>
      <AnimatedSection direction="scale" delay={0.3}>
        <Footer />
      </AnimatedSection>
      <MobileBottomNav />
    </div>
  );
}
