// Helper function to get category-specific images using placeholder service
export const getImageForCategory = (category: string, productName?: string): string => {
  const baseUrl = 'https://placehold.co/600x400';
  
  // Color scheme: background/text
  const categoryMap: { [key: string]: { bg: string; text: string; label: string } } = {
    // Agricultural
    'Rice': { bg: '2a9d8f', text: 'white', label: 'Rice+Farm' },
    'Corn': { bg: 'f4a261', text: 'white', label: 'Corn+Field' },
    'Mango': { bg: 'e76f51', text: 'white', label: 'Mango+Farm' },
    'Coconut': { bg: '264653', text: 'white', label: 'Coconut+Farm' },
    'Vegetables': { bg: '06a77d', text: 'white', label: 'Fresh+Vegetables' },
    'Abaca': { bg: '8d6e63', text: 'white', label: 'Abaca+Farm' },
    'Seafood': { bg: '0077b6', text: 'white', label: 'Fresh+Seafood' },
    
    // Industrial/Manufacturing
    'Packaging': { bg: '457b9d', text: 'white', label: 'Packaging+Factory' },
    'Flour': { bg: 'dda15e', text: 'white', label: 'Flour+Mill' },
    'Sugar': { bg: 'bc6c25', text: 'white', label: 'Sugar+Mill' },
    'Baking Ingredients': { bg: 'c1121f', text: 'white', label: 'Baking+Ingredients' },
    'Chemicals': { bg: '6a4c93', text: 'white', label: 'Food+Chemicals' },
    'Condiments': { bg: 'd62828', text: 'white', label: 'Condiments+Factory' },
    'Plastics': { bg: '1a759f', text: 'white', label: 'Plastic+Products' },
    'Coffee': { bg: '6f4518', text: 'white', label: 'Coffee+Roastery' },
    'Baked Goods': { bg: 'e9c46a', text: '333333', label: 'Bakery' },
    'Sweets': { bg: 'ff006e', text: 'white', label: 'Sweets+Factory' },
    'Footwear': { bg: '8b4513', text: 'white', label: 'Shoe+Factory' },
    'Furniture': { bg: '5a3e2b', text: 'white', label: 'Furniture+Workshop' },
    
    // Logistics & Services
    'Logistics': { bg: 'e63946', text: 'white', label: 'Logistics+Truck' },
    'Cold Storage': { bg: '023e8a', text: 'white', label: 'Cold+Storage' },
    'Cold Chain': { bg: '03045e', text: 'white', label: 'Cold+Chain' },
    
    // Retail
    'Retail': { bg: '7209b7', text: 'white', label: 'Retail+Store' },
    'Fresh Produce': { bg: '52b788', text: 'white', label: 'Fresh+Market' },
    'Pharmaceuticals': { bg: '00b4d8', text: 'white', label: 'Pharmacy' },
  };
  
  const config = categoryMap[category] || { bg: '6c757d', text: 'white', label: 'Product' };
  
  return `${baseUrl}/${config.bg}/${config.text}?text=${config.label}`;
};

// Helper to get image based on supplier role
export const getImageForSupplier = (category: string, role: string): string => {
  return getImageForCategory(category);
};
