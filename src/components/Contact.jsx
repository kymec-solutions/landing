import { motion } from 'framer-motion';
import { Mail, ArrowRight, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFeedback('');
    setIsError(false);

    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('send_failed');
      }

      setFeedback(t.contact.thankYou);
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        website: ''
      });
    } catch (error) {
      setIsError(true);
      setFeedback(t.contact.form.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full opacity-40" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-400 font-medium tracking-wider uppercase text-sm">
            {t.contact.subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            {t.contact.title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t.contact.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">{t.contact.workTogether}</h3>
              <p className="text-gray-400 leading-relaxed">
                {t.contact.workDescription}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.contact.email}</p>
                  <a href="mailto:hello@kymec.com" className="hover:text-blue-400 transition-colors">
                    hello@kymec.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.contact.location}</p>
                  <span>{t.contact.locationValue}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.contact.responseTime}</p>
                  <span>{t.contact.responseValue}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t.contact.form.name}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    placeholder={t.contact.form.namePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t.contact.form.email}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    placeholder={t.contact.form.emailPlaceholder}
                  />
                </div>
              </div>

              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.contact.form.company}</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  placeholder={t.contact.form.companyPlaceholder}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.contact.form.message}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all resize-none"
                  placeholder={t.contact.form.messagePlaceholder}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? t.contact.form.sending : t.contact.form.submit}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs text-gray-500 text-center">
                {t.contact.form.privacyNotice}{' '}
                <a
                  href="/privacy-policy/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t.contact.form.privacyLink}
                </a>
                .
              </p>

              {feedback ? (
                <p className={`text-sm ${isError ? 'text-red-400' : 'text-green-400'}`} role="status">
                  {feedback}
                </p>
              ) : null}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
