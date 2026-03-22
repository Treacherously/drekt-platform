/**
 * Auto-categorization utility for DREKT entities
 * Assigns entityType based on keywords in name, description, or businessType
 */

export type EntityType = 'Distributor' | 'Supplier' | 'Manufacturer' | 'Farm/Agriculture';

interface EntityData {
  name: string;
  description?: string;
  businessType?: string;
  role?: string;
}

/**
 * Categorizes an entity based on keywords in its data
 */
export function categorizeEntity(entity: EntityData): EntityType {
  const searchText = `${entity.name} ${entity.description || ''} ${entity.businessType || ''} ${entity.role || ''}`.toLowerCase();

  // Farm/Agriculture keywords
  const farmKeywords = [
    'farm', 'plantation', 'agriculture', 'agricultural', 'fishery', 'livestock',
    'rice', 'corn', 'coconut', 'mango', 'abaca', 'vegetable', 'sugar',
    'aquaculture', 'poultry', 'cattle', 'pig', 'chicken', 'crop'
  ];

  // Manufacturer keywords
  const manufacturerKeywords = [
    'manufacturer', 'manufacturing', 'factory', 'mill', 'plant', 'production',
    'food manufacturer', 'textile manufacturer', 'packaging manufacturer',
    'glass manufacturer', 'plastics manufacturer', 'chemical', 'industrial',
    'processing', 'assembly', 'fabrication', 'producer', 'maker'
  ];

  // Distributor keywords
  const distributorKeywords = [
    'distributor', 'distribution', 'supermarket', 'market', 'store', 'retail',
    'drugstore', 'department store', 'electronics store', 'hardware',
    'wholesaler', 'reseller', 'outlet', 'shop', 'mall'
  ];

  // Supplier keywords (raw materials, logistics, services)
  const supplierKeywords = [
    'supplier', 'supply', 'raw materials', 'logistics', 'cold chain',
    'packaging', 'equipment', 'trading', 'import', 'export', 'broker',
    'ingredients', 'components', 'parts', 'materials'
  ];

  // Check in priority order (most specific to least specific)
  
  // 1. Farm/Agriculture (most specific)
  if (farmKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Farm/Agriculture';
  }

  // 2. Manufacturer
  if (manufacturerKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Manufacturer';
  }

  // 3. Distributor
  if (distributorKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Distributor';
  }

  // 4. Supplier (default fallback)
  if (supplierKeywords.some(keyword => searchText.includes(keyword))) {
    return 'Supplier';
  }

  // Default: if role is 'Producer', likely a manufacturer
  if (entity.role?.toLowerCase() === 'producer') {
    return 'Manufacturer';
  }

  // Default: if role is 'Distributor'
  if (entity.role?.toLowerCase() === 'distributor') {
    return 'Distributor';
  }

  // Final fallback: Supplier
  return 'Supplier';
}

/**
 * Batch categorize multiple entities
 */
export function categorizeEntities<T extends EntityData>(entities: T[]): (T & { entityType: EntityType })[] {
  return entities.map(entity => ({
    ...entity,
    entityType: categorizeEntity(entity),
  }));
}
