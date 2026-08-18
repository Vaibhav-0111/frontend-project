import Navbar from './components/Navbar/Navbar';
import HeroReveal from './components/HeroReveal/HeroReveal';
import DesignSection from './components/DesignSection/DesignSection';
import PerformanceSection from './components/PerformanceSection/PerformanceSection';
import InteriorSection from './components/InteriorSection/InteriorSection';
import Footer from './components/Footer/Footer';

export default function App() {
  return (
    <main>
      <Navbar />
      <HeroReveal />
      <DesignSection />
      <PerformanceSection />
      <InteriorSection />
      <Footer />
    </main>
  );
}
