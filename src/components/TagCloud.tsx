'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { suppliers } from '../data/mockData';

interface TagCloudProps {
  onTagSelect: (tag: string, type: 'entityType' | 'productCategory') => void;
}

export default function TagCloud({ onTagSelect }: TagCloudProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Extract unique entity types and product categories from suppliers
  const entityTypes = Array.from(new Set(suppliers.map(s => s.entityType).filter(Boolean))) as string[];
  const productCategories = Array.from(new Set(suppliers.map(s => s.productCategory).filter(Boolean))) as string[];

  // Combine and alphabetize all tags
  const allTags = [
    ...entityTypes.map(tag => ({ label: tag, type: 'entityType' as const })),
    ...productCategories.map(tag => ({ label: tag, type: 'productCategory' as const })),
  ].sort((a, b) => a.label.localeCompare(b.label));

  // Prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-wide">
              Explore <span className="font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">DREKT</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide">
              Select a category to discover verified business partners
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-wide">
            Explore <span className="font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">DREKT</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide">
            Select a category to discover verified business partners
          </p>
        </motion.div>

        {/* Tag Cloud */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {allTags.map((tag, index) => (
              <motion.button
                key={`${tag.type}-${tag.label}`}
                onClick={() => onTagSelect(tag.label, tag.type)}
                className="group relative px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full text-white font-light tracking-wide transition-all duration-300 hover:bg-slate-700/70 hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.02 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Tag type indicator */}
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  tag.type === 'entityType' 
                    ? 'bg-blue-400' 
                    : 'bg-purple-400'
                }`} />
                
                {/* Tag label */}
                <span className="text-sm md:text-base">{tag.label}</span>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          {/* Legend */}
          <motion.div
            className="mt-12 flex justify-center gap-8 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
              <span>Entity Type</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400" />
              <span>Product Category</span>
            </div>
          </motion.div>

          {/* Browse All button */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <button
              onClick={() => onTagSelect('All', 'entityType')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-medium tracking-wide hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
            >
              Browse All Partners →
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
