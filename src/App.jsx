import { LanguageProvider } from './i18n/LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Expertise from './components/Expertise';
import Services from './components/Services';
import Process from './components/Process';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <LanguageProvider>
      <div className="bg-black min-h-screen text-gray-200 font-sans selection:bg-blue-500/30 selection:text-white">
        <Header />
        <main>
          <Hero />
          <Expertise />
          <Services />
          <Process />
          <Team />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
