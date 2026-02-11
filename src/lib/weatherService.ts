export interface WeatherData {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
  };
}

export interface RegionalWeather {
  region: string;
  latitude: number;
  longitude: number;
  windSpeed: number;
  precipitation: number;
  isHighRisk: boolean;
  riskFactors: string[];
}

export interface SourcingRegion {
  name: string;
  latitude: number;
  longitude: number;
  province: string;
}

// Top 5 sourcing regions in the Philippines
export const SOURCING_REGIONS: SourcingRegion[] = [
  {
    name: 'Nueva Ecija Rice Belt',
    latitude: 15.5784,
    longitude: 121.1113,
    province: 'Nueva Ecija',
  },
  {
    name: 'Isabela Agricultural Zone',
    latitude: 16.9754,
    longitude: 121.8107,
    province: 'Isabela',
  },
  {
    name: 'Bukidnon Highlands',
    latitude: 8.0542,
    longitude: 125.1289,
    province: 'Bukidnon',
  },
  {
    name: 'Benguet Vegetable Terraces',
    latitude: 16.4023,
    longitude: 120.5960,
    province: 'Benguet',
  },
  {
    name: 'Davao Agricultural Hub',
    latitude: 7.1907,
    longitude: 125.4553,
    province: 'Davao',
  },
];

/**
 * Fetch regional weather data from Open-Meteo API
 * @param lat Latitude of the region
 * @param lng Longitude of the region
 * @returns Weather data including precipitation and wind speed
 */
export async function getRegionalWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,windspeed_10m_max&timezone=Asia/Manila`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Analyze weather data and determine if region is high risk
 * Thresholds: Wind speed > 60 km/h OR Precipitation > 50mm
 */
export function analyzeWeatherRisk(
  region: SourcingRegion,
  weatherData: WeatherData
): RegionalWeather {
  // Get today's weather (first element in arrays)
  const todayWindSpeed = weatherData.daily.windspeed_10m_max[0] || 0;
  const todayPrecipitation = weatherData.daily.precipitation_sum[0] || 0;

  const riskFactors: string[] = [];
  let isHighRisk = false;

  // Check wind speed threshold
  if (todayWindSpeed > 60) {
    isHighRisk = true;
    riskFactors.push(`High winds: ${todayWindSpeed.toFixed(1)} km/h`);
  }

  // Check precipitation threshold
  if (todayPrecipitation > 50) {
    isHighRisk = true;
    riskFactors.push(`Heavy rainfall: ${todayPrecipitation.toFixed(1)} mm`);
  }

  return {
    region: region.name,
    latitude: region.latitude,
    longitude: region.longitude,
    windSpeed: todayWindSpeed,
    precipitation: todayPrecipitation,
    isHighRisk,
    riskFactors,
  };
}

/**
 * Scan all sourcing regions and return high-risk areas
 */
export async function scanAllRegions(): Promise<RegionalWeather[]> {
  const results: RegionalWeather[] = [];

  for (const region of SOURCING_REGIONS) {
    try {
      const weatherData = await getRegionalWeather(region.latitude, region.longitude);
      const analysis = analyzeWeatherRisk(region, weatherData);
      results.push(analysis);
    } catch (error) {
      console.error(`Failed to fetch weather for ${region.name}:`, error);
      // Add region with default safe values if API fails
      results.push({
        region: region.name,
        latitude: region.latitude,
        longitude: region.longitude,
        windSpeed: 0,
        precipitation: 0,
        isHighRisk: false,
        riskFactors: ['Data unavailable'],
      });
    }
  }

  return results;
}
