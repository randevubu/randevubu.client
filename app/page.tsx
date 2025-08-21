import { 
  Navbar, 
  Footer, 
  Hero, 
  HowItWorks, 
  Features, 
  Pricing 
} from './components';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}
