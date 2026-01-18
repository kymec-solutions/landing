import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Header() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const navItems = [
    { name: t.nav.services, href: '#services' },
    { name: t.nav.expertise, href: '#expertise' },
    { name: t.nav.team, href: '#team' },
    { name: t.nav.contact, href: '#contact' },
  ];
  const homeHref = language === 'es' ? '/es/' : '/en/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen ? 'bg-black/95' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo with hover animation */}
        <motion.a 
          href={homeHref}
          className="text-2xl font-bold tracking-tighter text-white group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative">
            KYMEC
            <span className="text-emerald-400">.</span>
            {/* Underline animation on hover */}
            <motion.span
              className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-amber-400 via-blue-500 to-purple-500"
              initial={{ width: 0 }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </motion.a>

        {/* Desktop Nav with pro hover effects */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item, index) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="relative px-4 py-2 text-sm text-gray-300 transition-colors"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ color: '#fff' }}
            >
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  >
                    {/* Gradient border effect */}
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                    <span className="absolute inset-[1px] rounded-lg bg-black/80" />
                    {/* Animated border */}
                    <motion.span 
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: `linear-gradient(90deg, rgba(59,130,246,0.5) 0%, rgba(168,85,247,0.5) 50%, rgba(59,130,246,0.5) 100%)`,
                        backgroundSize: '200% 100%',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        padding: '1px',
                      }}
                      animate={{
                        backgroundPosition: ['0% 0%', '200% 0%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                    {/* Glow effect */}
                    <motion.span 
                      className="absolute -inset-1 rounded-xl bg-blue-500/20 blur-md -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="relative z-10">{item.name}</span>
            </motion.a>
          ))}

          {/* Language Toggle */}
          <motion.button
            onClick={toggleLanguage}
            className="ml-4 flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg border border-white/10 hover:border-white/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language.toUpperCase()}</span>
          </motion.button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <motion.button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400"
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="w-4 h-4" />
            <span>{language.toUpperCase()}</span>
          </motion.button>
          <motion.button 
            className="text-gray-300 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navItems.map((item, index) => (
                <motion.a 
                  key={item.name} 
                  href={item.href} 
                  className="text-gray-300 hover:text-blue-400 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
