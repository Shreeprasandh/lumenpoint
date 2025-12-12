import React, { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // EmailJS configuration
      const serviceId = 'service_nl4nfhe';
      const templateId = 'template_t374ow6';
      const publicKey = 'vPMlpOUkvTr5BgtA2';

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
        to_email: 'canticumsong@gmail.com',
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      alert('Thank you for your message! We will get back to you soon.');
    } catch (error) {
      console.error('Email send failed:', error);
      setSubmitStatus('error');
      alert('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      className="py-32 bg-[#FAF6F2]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif text-[#683B2B] mb-12 text-center">Contact</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full bg-transparent border-b-2 border-[#683B2B] pb-2 text-[#683B2B] placeholder-[#683B2B] placeholder-opacity-60 focus:border-[#B08401] outline-none transition-colors duration-300"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full bg-transparent border-b-2 border-[#683B2B] pb-2 text-[#683B2B] placeholder-[#683B2B] placeholder-opacity-60 focus:border-[#B08401] outline-none transition-colors duration-300"
            />
          </div>

          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              required
              rows={4}
              className="w-full bg-transparent border-b-2 border-[#683B2B] pb-2 text-[#683B2B] placeholder-[#683B2B] placeholder-opacity-60 focus:border-[#B08401] outline-none resize-none transition-colors duration-300"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#683B2B] text-white py-3 px-6 rounded-lg hover:bg-[#B08401] transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  );
};

export default Contact;
