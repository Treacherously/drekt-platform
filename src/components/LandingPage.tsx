'use client';

import { motion } from 'framer-motion';
import { Package, Truck, Factory, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LandingPageProps {
  onCategorySelect: (category: 'Manufacturer' | 'Distributor' | 'Supplier' | 'Farm/Agriculture' | 'All') => void;
}

const categories = [
  {
    id: 'Supplier' as const,
    title: 'Suppliers',
    description: 'Find reliable suppliers for your raw materials and components',
    icon: Package,
    gradient: 'from-blue-500 to-cyan-500',
    hoverGradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'Distributor' as const,
    title: 'Distributors',
    description: 'Connect with distributors to expand your market reach',
    icon: Truck,
    gradient: 'from-purple-500 to-pink-500',
    hoverGradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'Manufacturer' as const,
    title: 'Manufacturers',
    description: 'Partner with manufacturers for production and scaling',
    icon: Factory,
    gradient: 'from-orange-500 to-red-500',
    hoverGradient: 'from-orange-600 to-red-600',
  },
  {
    id: 'Farm/Agriculture' as const,
    title: 'Farms & Agriculture',
    description: 'Source fresh produce and agricultural products directly from farms',
    icon: Building2,
    gradient: 'from-green-500 to-emerald-500',
    hoverGradient: 'from-green-600 to-emerald-600',
  },
  {
    id: 'All' as const,
    title: 'All Partners',
    description: 'Browse the complete network of verified business partners',
    icon: Building2,
    gradient: 'from-slate-500 to-gray-500',
    hoverGradient: 'from-slate-600 to-gray-600',
  },
];

export default function LandingPage({ onCategorySelect }: LandingPageProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Prevent hydration mismatch by returning null until client-side mount
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="relative overflow-hidden">
          <div className="relative z-10 container mx-auto px-6 py-24">
            <div className="text-center mb-20">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-white mb-6 tracking-wide">
                Welcome to <span className="font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">DREKT</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
                Your intelligent supply chain network. Connect, collaborate, and grow.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.1, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-24">
          {/* Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-white mb-6 tracking-wide">
              Welcome to{' '}
              <span className="font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DREKT
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
              Your intelligent supply chain network. Connect, collaborate, and grow.
            </p>
          </motion.div>

          {/* Category Cards Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => onCategorySelect(category.id)}
                  className="group relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Card content */}
                  <div className="relative p-10">
                    {/* Icon */}
                    <motion.div
                      className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${category.gradient} mb-6`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-3xl font-semibold text-white mb-3 tracking-wide group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {category.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-lg font-light leading-relaxed tracking-wide">
                      {category.description}
                    </p>

                    {/* Arrow indicator */}
                    <motion.div
                      className="mt-6 flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors duration-300"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-sm font-medium tracking-wider">EXPLORE</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Shine effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                </motion.button>
              );
            })}
          </motion.div>

          {/* Footer tagline */}
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <p className="text-gray-500 text-sm tracking-widest uppercase">
              Powered by intelligent matching algorithms
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
