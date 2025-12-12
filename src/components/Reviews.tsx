import React from 'react';
import { motion } from 'framer-motion';

const Reviews: React.FC = () => {
  const reviews = [
    {
      quote: "Finally, a platform that distills the noise into actionable insights. Brilliant work.",
      name: "Kishore A"
    },
    {
      quote: "Lumen Point transformed how I understand complex engineering concepts. The clarity is unmatched.",
      name: "Akshaya K"
    },
    {
      quote: "The intersection of F1 engineering and AI architecture explained beautifully. Essential reading.",
      name: "Chanakya P"
    }
  ];

  return (
    <motion.section
      className="py-32 bg-white"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif text-[#683B2B] mb-16 text-center">Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-sm p-8 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <blockquote className="text-lg italic font-serif text-[#683B2B] mb-6 leading-relaxed">
                "{review.quote}"
              </blockquote>
              <cite className="text-sm font-medium uppercase tracking-wide text-[#B08401]">
                {review.name}
              </cite>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Reviews;
