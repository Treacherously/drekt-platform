import { Supplier } from '../data/mockData';
import { RegionalWeather } from './weatherService';

export interface SupplierRisk {
  supplier: Supplier;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  status: 'Likely Delayed' | 'Logistics Blocked' | 'Normal' | 'At Risk';
  affectedBy: string[];
  weatherData?: RegionalWeather;
}

export interface Recommendation {
  id: string;
  type: 'alternative_supplier' | 'route_change' | 'stock_increase';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  affectedRegion: string;
  affectedSuppliers: Supplier[];
  alternativeSuppliers: Supplier[];
  action: string;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Analyze supply chain risk based on weather conditions
 */
export function analyzeSupplyRisk(
  suppliers: Supplier[],
  weatherRisks: RegionalWeather[]
): SupplierRisk[] {
  const supplierRisks: SupplierRisk[] = [];

  suppliers.forEach((supplier) => {
    if (!supplier.latitude || !supplier.longitude) {
      supplierRisks.push({
        supplier,
        riskLevel: 'low',
        status: 'Normal',
        affectedBy: [],
      });
      return;
    }

    const affectedBy: string[] = [];
    let highestRisk: RegionalWeather | null = null;

    // Check if supplier is affected by any high-risk weather zone
    weatherRisks.forEach((weather) => {
      if (weather.isHighRisk) {
        const distance = calculateDistance(
          supplier.latitude!,
          supplier.longitude!,
          weather.latitude,
          weather.longitude
        );

        // 100km radius for high-risk zones
        if (distance <= 100000) {
          affectedBy.push(weather.region);
          if (!highestRisk || weather.windSpeed > highestRisk.windSpeed) {
            highestRisk = weather;
          }
        }
      }
    });

    // Determine risk level and status based on supplier type and weather
    if (affectedBy.length > 0 && highestRisk) {
      let status: SupplierRisk['status'] = 'At Risk';
      let riskLevel: SupplierRisk['riskLevel'] = 'high';

      // Rice farmers, vegetable producers - highly weather dependent
      if (
        supplier.role === 'Producer' &&
        (supplier.productCategory.toLowerCase().includes('rice') ||
          supplier.productCategory.toLowerCase().includes('vegetable') ||
          supplier.productCategory.toLowerCase().includes('corn') ||
          supplier.productCategory.toLowerCase().includes('crop'))
      ) {
        status = 'Likely Delayed';
        riskLevel = 'critical';
      }
      // Factories, warehouses - logistics issues
      else if (
        supplier.role === 'Distributor' ||
        supplier.productCategory.toLowerCase().includes('canned') ||
        supplier.productCategory.toLowerCase().includes('packaged') ||
        supplier.productCategory.toLowerCase().includes('beverage')
      ) {
        status = 'Logistics Blocked';
        riskLevel = 'critical';
      }

      supplierRisks.push({
        supplier,
        riskLevel,
        status,
        affectedBy,
        weatherData: highestRisk,
      });
    } else {
      supplierRisks.push({
        supplier,
        riskLevel: 'low',
        status: 'Normal',
        affectedBy: [],
      });
    }
  });

  return supplierRisks;
}

/**
 * Generate strategic recommendations for supply chain resilience
 */
export function generateRecommendations(
  supplierRisks: SupplierRisk[],
  allSuppliers: Supplier[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Group affected suppliers by product category
  const affectedByCategory = new Map<string, SupplierRisk[]>();
  
  supplierRisks.forEach((risk) => {
    if (risk.riskLevel === 'critical' || risk.riskLevel === 'high') {
      const category = risk.supplier.productCategory;
      if (!affectedByCategory.has(category)) {
        affectedByCategory.set(category, []);
      }
      affectedByCategory.get(category)!.push(risk);
    }
  });

  // For each affected category, find alternative suppliers in safe zones
  affectedByCategory.forEach((affectedRisks, category) => {
    const affectedSuppliers = affectedRisks.map(r => r.supplier);
    const affectedRegions = [...new Set(affectedRisks.flatMap(r => r.affectedBy))];

    // Find safe suppliers with same product category
    const safeSuppliers = allSuppliers.filter((supplier) => {
      // Same product category
      if (supplier.productCategory !== category) return false;

      // Not in the affected list
      if (affectedSuppliers.some(a => a.id === supplier.id)) return false;

      // Check if supplier is in a safe zone (not affected by weather)
      const supplierRisk = supplierRisks.find(r => r.supplier.id === supplier.id);
      return supplierRisk && supplierRisk.riskLevel === 'low';
    });

    if (safeSuppliers.length > 0) {
      // Prioritize suppliers from different regions (Visayas/Mindanao if Luzon is affected)
      const luzonAffected = affectedRegions.some(r => 
        r.includes('Nueva Ecija') || r.includes('Isabela') || r.includes('Benguet')
      );

      const alternativeSuppliers = luzonAffected
        ? safeSuppliers.filter(s => 
            s.city.includes('Cebu') || 
            s.city.includes('Davao') || 
            s.city.includes('Bukidnon') ||
            s.city.includes('Iloilo')
          )
        : safeSuppliers;

      if (alternativeSuppliers.length > 0) {
        const primaryAlternative = alternativeSuppliers[0];
        const regionName = luzonAffected ? 'Luzon' : affectedRegions[0];

        recommendations.push({
          id: `rec-${category}-${Date.now()}`,
          type: 'alternative_supplier',
          severity: 'critical',
          title: `Supply Chain Break Detected in ${regionName}`,
          description: `${affectedSuppliers.length} ${category} supplier${affectedSuppliers.length > 1 ? 's' : ''} affected by severe weather conditions.`,
          affectedRegion: regionName,
          affectedSuppliers,
          alternativeSuppliers: alternativeSuppliers.slice(0, 3),
          action: `Shift orders to ${primaryAlternative.name} in ${primaryAlternative.city}`,
        });
      }
    }
  });

  return recommendations;
}

/**
 * Get region classification (Luzon, Visayas, Mindanao)
 */
export function getRegionClassification(city: string): 'Luzon' | 'Visayas' | 'Mindanao' | 'Unknown' {
  const luzonCities = ['Manila', 'Quezon', 'Caloocan', 'Pasig', 'Taguig', 'Makati', 'Mandaluyong', 
                       'San Juan', 'Marikina', 'Parañaque', 'Las Piñas', 'Muntinlupa', 'Valenzuela',
                       'Malabon', 'Navotas', 'Bulacan', 'Pampanga', 'Nueva Ecija', 'Isabela', 'Benguet'];
  
  const visayasCities = ['Cebu', 'Iloilo', 'Bacolod', 'Tacloban', 'Dumaguete', 'Mandaue', 'Lapu-Lapu'];
  
  const mindanaoCities = ['Davao', 'Cagayan de Oro', 'General Santos', 'Zamboanga', 'Butuan', 'Bukidnon'];

  if (luzonCities.some(c => city.includes(c))) return 'Luzon';
  if (visayasCities.some(c => city.includes(c))) return 'Visayas';
  if (mindanaoCities.some(c => city.includes(c))) return 'Mindanao';
  
  return 'Unknown';
}
