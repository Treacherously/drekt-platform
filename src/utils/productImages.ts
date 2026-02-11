// Product image mapping based on product names and categories
export const getProductImage = (productName: string, category?: string): string => {
  const name = productName.toLowerCase();
  const cat = category?.toLowerCase() || '';

  // Electronics
  if (name.includes('microcontroller') || name.includes('mcu')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop';
  }
  if (name.includes('led') || name.includes('display')) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
  }
  if (name.includes('capacitor') || name.includes('resistor')) {
    return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop';
  }
  if (cat.includes('electronics')) {
    return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=300&fit=crop';
  }

  // Industrial Parts
  if (name.includes('hydraulic') || name.includes('pump')) {
    return 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop';
  }
  if (name.includes('bearing') || name.includes('industrial')) {
    return 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop';
  }
  if (name.includes('conveyor') || name.includes('belt')) {
    return 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=300&fit=crop';
  }
  if (cat.includes('industrial')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop';
  }

  // Textiles
  if (name.includes('fabric') || name.includes('textile') || name.includes('cotton')) {
    return 'https://images.unsplash.com/photo-1558769132-cb1aea3c8e5e?w=400&h=300&fit=crop';
  }
  if (name.includes('polyester') || name.includes('cloth')) {
    return 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400&h=300&fit=crop';
  }
  if (cat.includes('textile')) {
    return 'https://images.unsplash.com/photo-1558769132-92e717d613cd?w=400&h=300&fit=crop';
  }

  // Food & Agriculture
  if (name.includes('rice') || name.includes('grain')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
  }
  if (name.includes('banana') || name.includes('fruit')) {
    return 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop';
  }
  if (name.includes('vegetable') || name.includes('produce')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop';
  }
  if (name.includes('coffee') || name.includes('bean')) {
    return 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop';
  }
  if (cat.includes('food') || cat.includes('agriculture')) {
    return 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop';
  }

  // Construction Materials
  if (name.includes('cement') || name.includes('concrete')) {
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop';
  }
  if (name.includes('steel') || name.includes('rebar') || name.includes('metal')) {
    return 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop';
  }
  if (name.includes('lumber') || name.includes('wood') || name.includes('timber')) {
    return 'https://images.unsplash.com/photo-1551127481-43279ba57543?w=400&h=300&fit=crop';
  }
  if (cat.includes('construction')) {
    return 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop';
  }

  // Chemicals
  if (name.includes('chemical') || name.includes('solvent')) {
    return 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop';
  }
  if (cat.includes('chemical')) {
    return 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop';
  }

  // Automotive
  if (name.includes('tire') || name.includes('wheel')) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
  }
  if (name.includes('engine') || name.includes('motor')) {
    return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop';
  }
  if (cat.includes('automotive')) {
    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop';
  }

  // Packaging
  if (name.includes('box') || name.includes('carton') || name.includes('packaging')) {
    return 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=300&fit=crop';
  }
  if (cat.includes('packaging')) {
    return 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop';
  }

  // Default fallback image
  return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop';
};
