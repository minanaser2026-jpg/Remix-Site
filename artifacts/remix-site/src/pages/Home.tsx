import ScrollProgress from '../components/ScrollProgress';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Reels from '../components/Reels';
import SocialLinks from '../components/SocialLinks';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="relative w-full bg-background min-h-screen text-foreground selection:bg-primary selection:text-white">
      <div className="bg-noise" />
      <ScrollProgress />
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Reels />
        <SocialLinks />
      </main>
      
      <Footer />
    </div>
  );
}
