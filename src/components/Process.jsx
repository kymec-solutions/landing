import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Calendar,
  MessageCircle,
  FileText,
  Code2,
  Rocket,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';
import { useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const icons = [Calendar, MessageCircle, FileText, Code2, Rocket, ShieldCheck, LifeBuoy];

export default function Process() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'end 0.2'],
  });
  const lineProgress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <section id="process" className="py-24 md:py-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-emerald-300 font-medium tracking-wider uppercase text-sm">
            {t.process.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            {t.process.title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t.process.description}
          </p>
        </motion.div>

        <div ref={sectionRef} className="relative max-w-4xl mx-auto">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
          <motion.div
            className="absolute left-5 top-0 bottom-0 w-px origin-top bg-gradient-to-b from-emerald-300/0 via-emerald-400/80 to-lime-300/80"
            style={{ scaleY: lineProgress }}
          />

          <div className="space-y-10">
            {t.process.steps.map((step, index) => {
              const Icon = icons[index % icons.length];
              const stepNumber = String(index + 1).padStart(2, '0');
              return (
                <motion.div
                  key={`${step.title}-${index}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
                  transition={{ duration: 0.6, delay: index * 0.06 }}
                  className="relative pl-14 md:pl-16"
                >
                  <motion.span
                    className="absolute left-5 top-7 h-px w-10 bg-gradient-to-r from-emerald-300/80 to-emerald-500/0 origin-left"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                  <div className="absolute left-5 top-7 -translate-x-1/2">
                    <motion.div
                      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                      initial={{ scale: 0.7, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                  </div>

                  <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-6 md:p-7 hover:border-emerald-400/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-semibold text-emerald-200/80 tracking-widest bg-emerald-500/10 border border-emerald-400/20 rounded-full px-3 py-1">
                        {t.process.stepLabel} {stepNumber}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity -z-10" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
