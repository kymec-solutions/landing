import { motion } from 'framer-motion';
import { Lightbulb, Cpu, Rocket, Layers, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const icons = [Lightbulb, Cpu, Rocket, Layers];

export default function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-24 md:py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-400 font-medium tracking-wider uppercase text-sm">
            {t.services.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            {t.services.title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t.services.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {t.services.items.map((service, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative"
              >
                <div className="h-full bg-zinc-900/70 border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-500 flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    {service.title}
                    <ArrowUpRight className="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 mb-6 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span 
                        key={feature}
                        className="px-3 py-1 text-sm text-gray-300 bg-white/5 rounded-full border border-white/10"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/15 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
