import { 
  Navbar, 
  Footer, 
  Hero, 
  HowItWorks, 
  Features, 
  Pricing 
} from '../components';
import MobileBottomNav from '../components/layout/MobileBottomNav';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--theme-background)] transition-colors duration-300">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
