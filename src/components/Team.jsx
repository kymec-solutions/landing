import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { yaoMingData, recruiterData, barbaraData, solData, alessandroData, fullstackData } from '../i18n/translations';
import yaomingImg from '../assets/yaoming.jpeg';
import melinaImg from '../assets/melina.jpeg';
import barbaraImg from '../assets/barbara.jpeg';
import solImg from '../assets/sol.jpeg';
import alessandroImg from '../assets/alessandro.jpeg';
import stealthCloak from '../assets/stealth.png';

export default function Team() {
  const { language, t } = useLanguage();
  const teamMembers = [
    {
      id: 'yao',
      name: yaoMingData.name,
      role: yaoMingData.role[language],
      bio: yaoMingData.bio[language],
      linkedin: yaoMingData.linkedin,
      image: yaomingImg,
      initials: 'YK',
      roleClass: 'text-blue-400',
      borderClass: 'hover:border-blue-500/30',
      avatarGradient: 'from-blue-500/10 to-purple-500/10',
      avatarRing: 'border-blue-500/40',
      avatarText: 'text-blue-200'
    },
    {
      id: 'barbara',
      name: barbaraData.name,
      role: barbaraData.role[language],
      bio: barbaraData.bio[language],
      linkedin: barbaraData.linkedin,
      image: barbaraImg,
      initials: 'BH',
      roleClass: 'text-purple-400',
      borderClass: 'hover:border-purple-500/30',
      avatarGradient: 'from-purple-500/15 to-blue-500/10',
      avatarRing: 'border-purple-500/40',
      avatarText: 'text-purple-200'
    },
    {
      id: 'alessandro',
      name: alessandroData.name,
      role: alessandroData.role[language],
      bio: alessandroData.bio[language],
      linkedin: alessandroData.linkedin,
      image: alessandroImg,
      initials: 'AG',
      roleClass: 'text-cyan-400',
      borderClass: 'hover:border-cyan-500/30',
      avatarGradient: 'from-cyan-500/15 to-sky-500/10',
      avatarRing: 'border-cyan-500/40',
      avatarText: 'text-cyan-200'
    },
        {
      id: 'sol',
      name: solData.name,
      role: solData.role[language],
      bio: solData.bio[language],
      linkedin: solData.linkedin,
      image: solImg,
      initials: 'SM',
      roleClass: 'text-amber-400',
      borderClass: 'hover:border-amber-500/30',
      avatarGradient: 'from-amber-500/15 to-orange-500/10',
      avatarRing: 'border-amber-500/40',
      avatarText: 'text-amber-200'
    },
    {
      id: 'melina',
      name: recruiterData.name,
      role: recruiterData.role[language],
      bio: recruiterData.bio[language],
      linkedin: recruiterData.linkedin,
      image: melinaImg,
      initials: 'MC',
      roleClass: 'text-emerald-400',
      borderClass: 'hover:border-emerald-500/30',
      avatarGradient: 'from-emerald-500/15 to-teal-500/10',
      avatarRing: 'border-emerald-500/40',
      avatarText: 'text-emerald-200'
    },


    {
      id: 'fullstack',
      name: fullstackData.name[language],
      role: fullstackData.role[language],
      bio: fullstackData.bio[language],
      image: stealthCloak,
      initials: 'EC',
      roleClass: 'text-sky-400',
      borderClass: 'hover:border-sky-500/30',
      avatarGradient: 'from-sky-500/15 to-indigo-500/10',
      avatarRing: 'border-sky-500/40',
      avatarText: 'text-sky-200'
    }
  ];

  return (
    <section id="team" className="py-24 md:py-32 bg-zinc-900 relative overflow-hidden">
      {/* Decorative elements */}
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-400 font-medium tracking-wider uppercase text-sm">
            {t.team.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            {t.team.title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t.team.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => {
            const useCenteredLayout = teamMembers.length === 5;
            const lgPositionClass = useCenteredLayout
              ? index === 3
                ? 'lg:col-start-2 lg:col-span-2'
                : index === 4
                ? 'lg:col-start-4 lg:col-span-2'
                : 'lg:col-span-2'
              : 'lg:col-span-2';

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group ${lgPositionClass}`}
              >
                <div
                  className={`h-full bg-black/70 border border-white/10 rounded-2xl overflow-hidden ${member.borderClass} transition-all duration-500 flex flex-col`}
                >
                  <div
                    className={`relative h-72 md:h-80 overflow-hidden ${
                      member.image
                        ? 'bg-gradient-to-br from-zinc-800 to-zinc-900'
                        : `bg-gradient-to-br ${member.avatarGradient}`
                    } flex items-center justify-center`}
                  >
                    {member.image ? (
                      <motion.img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                        decoding="async"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7 }}
                      />
                    ) : (
                      <motion.div
                        className="text-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div
                          className={`w-24 h-24 rounded-full bg-black/40 border ${member.avatarRing} ${member.avatarText} flex items-center justify-center text-xl font-semibold tracking-wide`}
                        >
                          {member.initials}
                        </div>
                      </motion.div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className={`${member.roleClass} text-sm font-medium mb-4`}>{member.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {member.bio}
                    </p>

                    {member.linkedin && (
                      <div className="flex gap-3 mt-auto">
                        <motion.a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Linkedin className="w-4 h-4" />
                        </motion.a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
