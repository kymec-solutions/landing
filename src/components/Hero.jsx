import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import GradientBlinds from "./GradientBlinds";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-x-hidden pt-24 sm:pt-28 md:pt-0">
      {/* Base Background */}
      <div className="absolute inset-0 z-0 bg-[#050505]" />

      {/* Interactive Gradient Blinds */}
      <GradientBlinds
        className="absolute inset-0 z-10"
        amount={80}
        angle={30}
        noise={0.3}
        distortAmount={1.5}
        mirrorGradient="Mirror"
        shineDirection="Left"
        spotlight={{ radius: 0.2, softness: 1, opacity: 1, mouseDampening: 0.3 }}
        colors={{
          paletteCount: 4,
          bgColor: '#000000',
          color1: '#00FF9C',
          color2: '#00E676',
          color3: '#00FFA3',
          color4: '#7CFF00',
          color5: '#00FF9C',
          color6: '#00D97E',
          color7: '#7CFF00',
          color8: '#00FFA3',
        }}
        style={{
          WebkitMaskImage:
            'linear-gradient(0deg, rgba(0,0,0,0) 14%, rgba(0,0,0,1) 100%)',
          maskImage:
            'linear-gradient(0deg, rgba(0,0,0,0) 14%, rgba(0,0,0,1) 100%)',
        }}
      />

      <div className="relative z-30 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.2] mb-6 sm:mb-8"
        >
          <motion.span
            className="bg-gradient-to-r from-emerald-100 via-green-200 to-lime-200 bg-clip-text text-transparent inline-block leading-[1.2]"
            style={{ backgroundSize: "200% 100%" }}
          >
            {t.hero.title1}
          </motion.span>
          <br />
          <motion.span
            className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent inline-block leading-[1.2]"
            style={{ backgroundSize: "200% 100%" }}
          >
            {t.hero.title2}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed"
        >
          {t.hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#contact"
            className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.hero.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.a>
          <motion.a
            href="#expertise"
            className="px-8 py-4 text-gray-300 hover:text-white font-medium border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            {t.hero.learnMore}
          </motion.a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 sm:mt-16 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm text-gray-200 bg-black/70 border border-white/10 rounded-2xl px-4 py-3 mx-auto"
        >
          {(t.hero.trustBadges || []).flatMap((badge, index, arr) => (
            <span key={`badge-${index}`} className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-gray-500" />
      </motion.div>
    </section>
  );
}
