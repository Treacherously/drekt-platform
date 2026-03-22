'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'clear';

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  region: string;
  regionCode: string;
  detail: string;
  affectedCargo: string[];
  delayEstimate: string;
  issuedAt: string;
  source: string;
  weatherIcon?: string;
  tempC?: number;
  windKph?: number;
}

// ─── City config — key PH logistics hubs ─────────────────────────────────────

interface CityConfig {
  query: string;
  label: string;
  region: string;
  regionCode: string;
  affectedCargo: string[];
}

const CITIES: CityConfig[] = [
  {
    query: 'Manila,ph',
    label: 'Manila (NCR)',
    region: 'Metro Manila',
    regionCode: 'NCR',
    affectedCargo: ['Container Cargo', 'Consumer Goods', 'All Freight'],
  },
  {
    query: 'San Fernando,ph',
    label: 'San Fernando',
    region: 'Central Luzon',
    regionCode: 'Region III',
    affectedCargo: ['Rice', 'Onions', 'Fresh Produce', 'Root Crops'],
  },
  {
    query: 'Cebu City,ph',
    label: 'Cebu City',
    region: 'Central Visayas',
    regionCode: 'Region VII',
    affectedCargo: ['Sugar', 'Seafood', 'Coconut Products', 'Electronic Components'],
  },
  {
    query: 'Davao City,ph',
    label: 'Davao City',
    region: 'Davao Region',
    regionCode: 'Region XI',
    affectedCargo: ['Bananas', 'Tuna', 'Rubber', 'Tropical Fruits'],
  },
];

// ─── OWM response type (partial) ─────────────────────────────────────────────

interface OWMResponse {
  name: string;
  weather: { id: number; main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number };
  dt: number;
  cod: number | string;
  message?: string;
}

// ─── Condition mapping ────────────────────────────────────────────────────────

function mapConditionToAlert(
  data: OWMResponse,
  city: CityConfig
): WeatherAlert {
  const condition = data.weather[0];
  const id = condition.id;
  const main = condition.main;
  const desc = condition.description;
  const tempC = Math.round(data.main.temp);
  const windKph = Math.round(data.wind.speed * 3.6);
  const now = new Date().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // ── Thunderstorm (2xx) ── critical
  if (id >= 200 && id < 300) {
    return {
      id: `live-${city.query}`,
      severity: 'critical',
      title: `THUNDERSTORM ALERT — ${city.label}`,
      region: city.region,
      regionCode: city.regionCode,
      detail: `Active thunderstorm reported over ${city.label} (${desc}). Winds at ${windKph} km/h, temperature ${tempC}°C. Severe weather conditions may disrupt ground and air freight operations. Exercise extreme caution.`,
      affectedCargo: city.affectedCargo,
      delayEstimate: '24–48 hours',
      issuedAt: `${now} PHT`,
      source: 'OpenWeatherMap (Live)',
      weatherIcon: condition.icon,
      tempC,
      windKph,
    };
  }

  // ── Drizzle (3xx) ── info
  if (id >= 300 && id < 400) {
    return {
      id: `live-${city.query}`,
      severity: 'info',
      title: `DRIZZLE NOTICE — ${city.label}`,
      region: city.region,
      regionCode: city.regionCode,
      detail: `Light drizzle reported in ${city.label} (${desc}). Temperature ${tempC}°C, wind ${windKph} km/h. Minor delays possible for open-air loading operations.`,
      affectedCargo: city.affectedCargo,
      delayEstimate: '1–3 hours',
      issuedAt: `${now} PHT`,
      source: 'OpenWeatherMap (Live)',
      weatherIcon: condition.icon,
      tempC,
      windKph,
    };
  }

  // ── Rain (5xx) — differentiate heavy vs light ──
  if (id >= 500 && id < 600) {
    const isHeavy = id >= 502;
    return {
      id: `live-${city.query}`,
      severity: isHeavy ? 'warning' : 'info',
      title: `${isHeavy ? 'HEAVY RAIN ADVISORY' : 'RAIN NOTICE'} — ${city.label}`,
      region: city.region,
      regionCode: city.regionCode,
      detail: `${isHeavy ? 'Heavy rainfall' : 'Rain'} reported in ${city.label} (${desc}). Temperature ${tempC}°C, wind ${windKph} km/h. ${isHeavy ? 'Road flooding possible; expect delays on key freight corridors.' : 'Monitor road conditions; minor delays possible.'}`,
      affectedCargo: city.affectedCargo,
      delayEstimate: isHeavy ? '12–24 hours' : '2–6 hours',
      issuedAt: `${now} PHT`,
      source: 'OpenWeatherMap (Live)',
      weatherIcon: condition.icon,
      tempC,
      windKph,
    };
  }

  // ── Atmosphere (7xx): fog, haze, smoke ── info
  if (id >= 700 && id < 800) {
    return {
      id: `live-${city.query}`,
      severity: 'info',
      title: `VISIBILITY ADVISORY — ${city.label}`,
      region: city.region,
      regionCode: city.regionCode,
      detail: `Reduced visibility (${desc}) in ${city.label}. Temperature ${tempC}°C, wind ${windKph} km/h. Drivers are advised to exercise caution on major freight corridors.`,
      affectedCargo: city.affectedCargo,
      delayEstimate: '2–4 hours',
      issuedAt: `${now} PHT`,
      source: 'OpenWeatherMap (Live)',
      weatherIcon: condition.icon,
      tempC,
      windKph,
    };
  }

  // ── Extreme (900+) ── critical
  if (id >= 900) {
    return {
      id: `live-${city.query}`,
      severity: 'critical',
      title: `EXTREME WEATHER — ${city.label}`,
      region: city.region,
      regionCode: city.regionCode,
      detail: `Extreme weather event (${desc}) detected in ${city.label}. Winds ${windKph} km/h, temperature ${tempC}°C. All non-essential freight operations should be suspended.`,
      affectedCargo: city.affectedCargo,
      delayEstimate: '48–72 hours',
      issuedAt: `${now} PHT`,
      source: 'OpenWeatherMap (Live)',
      weatherIcon: condition.icon,
      tempC,
      windKph,
    };
  }

  // ── Clear (800) or Clouds (80x) ── clear
  return {
    id: `live-${city.query}`,
    severity: 'clear',
    title: `CLEAR CONDITIONS — ${city.label}`,
    region: city.region,
    regionCode: city.regionCode,
    detail: `${main === 'Clear' ? 'Clear skies' : 'Partly cloudy'} in ${city.label} (${desc}). Temperature ${tempC}°C, wind ${windKph} km/h. No weather-related disruptions expected.`,
    affectedCargo: [],
    delayEstimate: 'None',
    issuedAt: `${now} PHT`,
    source: 'OpenWeatherMap (Live)',
    weatherIcon: condition.icon,
    tempC,
    windKph,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseWeatherAlertsResult {
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useWeatherAlerts(): UseWeatherAlertsResult {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    if (!apiKey) {
      setError('Weather API key is not configured. Set NEXT_PUBLIC_WEATHER_API_KEY in .env.local.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled(
          CITIES.map((city) =>
            fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.query)}&appid=${apiKey}&units=metric`
            ).then((res) => res.json() as Promise<OWMResponse>)
          )
        );

        const mapped: WeatherAlert[] = [];

        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            const data = result.value;
            if (data.cod === 200 || data.cod === '200') {
              mapped.push(mapConditionToAlert(data, CITIES[i]));
            } else {
              // API returned an error object (e.g. city not found)
              mapped.push({
                id: `err-${CITIES[i].query}`,
                severity: 'info',
                title: `DATA UNAVAILABLE — ${CITIES[i].label}`,
                region: CITIES[i].region,
                regionCode: CITIES[i].regionCode,
                detail: `Could not retrieve weather data for ${CITIES[i].label}. Reason: ${data.message ?? 'Unknown error'}.`,
                affectedCargo: [],
                delayEstimate: 'N/A',
                issuedAt: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
                source: 'OpenWeatherMap',
              });
            }
          }
          // silently skip rejected (network failure for one city)
        });

        // Sort: critical first, then warning, then info, then clear
        const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2, clear: 3 };
        mapped.sort((a, b) => order[a.severity] - order[b.severity]);

        setAlerts(mapped);
        setLastUpdated(new Date());
      } catch (err) {
        setError('Failed to fetch weather data. Please check your network connection and API key.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [tick]);

  return { alerts, loading, error, lastUpdated, refresh };
}
