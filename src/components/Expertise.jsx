import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, Gift, Code2, Headphones } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Expertise() {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { icon: Clock, value: '8+', label: t.expertise.stats.years, color: 'blue' },
    { icon: Gift, value: language === 'es' ? 'GRATIS' : 'FREE', label: t.expertise.stats.quote, color: 'green' },
    { icon: Code2, value: 'Full', label: t.expertise.stats.tech, color: 'purple' },
    { icon: Headphones, value: '24/7', label: t.expertise.stats.support, color: 'orange' },
  ];

  return (
    <section id="expertise" className="py-24 md:py-32 bg-zinc-900 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-400 font-medium tracking-wider uppercase text-sm">
            {t.expertise.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            {t.expertise.title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t.expertise.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-black/70 border border-white/10 rounded-2xl p-6 md:p-8 text-center hover:border-blue-500/30 transition-all duration-300 h-full">
                {/* Icon */}
                <motion.div 
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    stat.color === 'green' ? 'bg-green-500/10 text-green-400' :
                    stat.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                    stat.color === 'orange' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="w-6 h-6" />
                </motion.div>
                
                {/* Value */}
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                
                {/* Label */}
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
              </div>
              
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
