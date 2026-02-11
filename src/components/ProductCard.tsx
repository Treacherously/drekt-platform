'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContactModal from './ContactModal';
import { getProductImage } from '../utils/productImages';

export interface ProductCardProps {
  productId: string;
  productTitle: string;
  productDescription?: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  city: string;
  price?: number;
  stockLevel?: 'high' | 'medium' | 'low';
  verified?: boolean;
  imageUrl?: string;
  category?: string;
}

export default function ProductCard({
  productId,
  productTitle,
  productDescription,
  supplierId,
  supplierName,
  supplierEmail,
  city,
  price,
  stockLevel,
  verified = true,
  imageUrl,
  category,
}: ProductCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get product image if not provided
  const productImage = imageUrl || getProductImage(productTitle, category);

  const handleSupplierClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/supplier/${supplierId}`);
  };

  const handleDrektItClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const getStockLevelColor = () => {
    switch (stockLevel) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="group relative">
      {/* Glassmorphism Card with Hover Lift Effect */}
      <div className="glass-dark rounded-lg p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-white/10 backdrop-blur-lg bg-white/5 dark:bg-gray-800/30">
        {/* Verified Badge - Top Right */}
        {verified && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg">
              <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="mb-3 overflow-hidden rounded-lg bg-gradient-to-br from-primary-400/20 to-primary-600/20 h-36 flex items-center justify-center">
          <img
            src={productImage}
            alt={productTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Category Badge */}
        {category && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              {category}
            </span>
          </div>
        )}

        {/* Product Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2">
          {productTitle}
        </h3>

        {/* Product Description */}
        {productDescription && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {productDescription}
          </p>
        )}

        {/* Supplier Info - Clickable */}
        <div className="mb-3 pb-2 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
            <button
              onClick={handleSupplierClick}
              className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
            >
              {supplierName}
            </button>
          </div>
        </div>

        {/* City and Stock Info */}
        <div className="space-y-1.5 mb-3">
          {/* City */}
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium text-gray-700 dark:text-gray-300">{city}</span>
          </div>

          {/* Stock Level */}
          {stockLevel && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Stock:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStockLevelColor()}`}>
                {stockLevel.charAt(0).toUpperCase() + stockLevel.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        {price !== undefined && (
          <div className="mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
            <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
              ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          {/* DREKT IT Button */}
          <button
            onClick={handleDrektItClick}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            DREKT IT
          </button>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplierName={supplierName}
        supplierEmail={supplierEmail}
        productName={productTitle}
      />
    </div>
  );
}
