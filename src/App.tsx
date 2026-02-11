import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './styles/globals.css';
import Dropdown, { DropdownItem } from './components/Dropdown';
import { cities, producerCategories, distributorTypes, suppliers, Supplier } from './data/mockData';
import InboxPage from './pages/InboxPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import VisionPage from './pages/VisionPage';
import dynamic from 'next/dynamic';

const BusinessMap = dynamic(() => import('./components/BusinessMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-250px)] rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

const NetworkPage = dynamic(() => import('./app/network/page'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <p className="text-gray-600 dark:text-gray-400">Loading DREKT CONNECTIONS...</p>
    </div>
  ),
});

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedProducer, setSelectedProducer] = useState<string>('');
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Supplier[]>(suppliers);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [sortByNearest, setSortByNearest] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'inbox' | 'profile' | 'settings' | 'vision' | 'network'>('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default to false (light mode for enterprise)
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode !== null ? savedMode === 'true' : false;
    }
    return false;
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const router = useRouter();

  // Apply dark mode class to document.documentElement and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const cityItems: DropdownItem[] = cities.map((city: string) => ({
    id: city.toLowerCase().replace(/\s+/g, '-'),
    label: city,
    value: city,
  }));

  const producerItems: DropdownItem[] = producerCategories.map((category: string) => ({
    id: category.toLowerCase().replace(/\s+/g, '-'),
    label: category,
    value: category,
  }));

  const distributorItems: DropdownItem[] = distributorTypes.map((type: string) => ({
    id: type.toLowerCase().replace(/\s+/g, '-'),
    label: type,
    value: type,
  }));

  // SAFE HAVERSINE DISTANCE FUNCTION - Crash-proof with guardrails
  const getDistance = (lat1: number | undefined, lon1: number | undefined, lat2: number | undefined, lon2: number | undefined): number => {
    // CRITICAL GUARDRAIL: Check all inputs immediately
    if (!lat1 || !lon1 || !lat2 || !lon2 || isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      return Infinity; // Bad data gets sorted to bottom
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };

  // GET USER LOCATION HANDLER - Crash-proof with error handling
  const handleGetLocation = () => {
    // Strict geolocation check
    if (!('geolocation' in navigator)) {
      alert('GPS not supported by your browser');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setSortByNearest(true);
        setIsLocating(false);
        console.log('User location obtained:', position.coords.latitude, position.coords.longitude);
      },
      // Error callback
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Location access denied';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        alert(errorMessage);
        console.error('Geolocation error:', error);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // TOGGLE SORT BY NEAREST - Professional toggle logic
  const handleToggleSortByNearest = () => {
    if (!sortByNearest && !userLocation) {
      // First time: get location
      handleGetLocation();
    } else {
      // Toggle on/off
      setSortByNearest(prev => !prev);
    }
  };

  // STRICT AND PIPELINE - Sequential filtering with exact matches
  useEffect(() => {
    console.log('=== FILTER PIPELINE START ===');
    console.log('Initial businesses:', suppliers.length);
    
    // Start with ALL businesses
    let result = [...suppliers];

    // Step 1: Strict Location Filter (City)
    if (selectedCity && selectedCity !== '' && selectedCity !== 'All') {
      result = result.filter(b => b.city === selectedCity);
      console.log('After Location Filter (', selectedCity, '):', result.length);
    }

    // Step 2: Strict Producer Category Filter
    if (selectedProducer && selectedProducer !== '' && selectedProducer !== 'All') {
      result = result.filter(b => b.role === 'Producer' && b.productCategory === selectedProducer);
      console.log('After Producer Filter (', selectedProducer, '):', result.length);
    }

    // Step 3: Strict Distributor Type Filter
    if (selectedDistributor && selectedDistributor !== '' && selectedDistributor !== 'All') {
      result = result.filter(b => b.role === 'Distributor' && b.businessType === selectedDistributor);
      console.log('After Distributor Filter (', selectedDistributor, '):', result.length);
    }

    // Step 4: Search Text (Name or Product) - Simple .includes()
    if (searchQuery && searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.name.toLowerCase().includes(lowerQuery) ||
        b.products.some(p => p.name.toLowerCase().includes(lowerQuery))
      );
      console.log('After Search Filter ("', searchQuery, '"):', result.length);
    }

    console.log('Before deduplication:', result.length, 'businesses');
    
    // DEDUPLICATION: Remove duplicates based on ID
    const uniqueResults = Array.from(
      new Map(result.map(item => [item.id, item])).values()
    );
    
    console.log('After deduplication:', uniqueResults.length, 'businesses');
    console.log('=== FINAL RESULT:', uniqueResults.length, 'unique businesses ===');
    
    // IMMUTABLE SORTING: Sort by distance if 'Sort by Nearest' is active
    let finalResults = uniqueResults;
    
    if (sortByNearest && userLocation) {
      console.log('Sorting by distance from user location...');
      // Create a COPY first - never mutate state directly
      const sorted = [...uniqueResults];
      
      sorted.sort((a, b) => {
        const distanceA = getDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distanceB = getDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
      
      finalResults = sorted;
      console.log('Sorted by distance. Nearest:', sorted[0]?.name, 'at', getDistance(userLocation.lat, userLocation.lng, sorted[0]?.latitude, sorted[0]?.longitude).toFixed(1), 'km');
    }
    
    // Update filtered state with deduplicated and optionally sorted results
    setFilteredBusinesses(finalResults);
  }, [searchQuery, selectedCity, selectedProducer, selectedDistributor, sortByNearest, userLocation]);

  const filteredSuppliers = filteredBusinesses;

  const handleCitySelect = (item: DropdownItem) => {
    console.log('City selected:', item.value);
    setSelectedCity(item.value);
  };

  const handleProducerSelect = (item: DropdownItem) => {
    console.log('Producer category selected:', item.value);
    setSelectedProducer(item.value);
  };

  const handleDistributorSelect = (item: DropdownItem) => {
    console.log('Distributor type selected:', item.value);
    setSelectedDistributor(item.value);
  };

  const clearFilter = (filterType: 'city' | 'producer' | 'distributor') => {
    if (filterType === 'city') setSelectedCity('');
    if (filterType === 'producer') setSelectedProducer('');
    if (filterType === 'distributor') setSelectedDistributor('');
  };

  const clearAllFilters = () => {
    setSelectedCity('');
    setSelectedProducer('');
    setSelectedDistributor('');
    setSearchQuery('');
    setSortByNearest(false);
    setUserLocation(null);
  };

  const hasActiveFilters = selectedCity || selectedProducer || selectedDistributor;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <aside
        className={`bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-shrink-0 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-slate-700">
            {sidebarOpen && (
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                DREKT
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'}
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {sidebarOpen && <span className="font-medium">Dashboard</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('vision')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'vision'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {sidebarOpen && <span className="font-medium">DREKT VISION</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('network')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'network'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {sidebarOpen && <span className="font-medium">DREKSTATS</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('inbox')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'inbox'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {sidebarOpen && <span className="font-medium">Inbox</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'profile'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {sidebarOpen && <span className="font-medium">Profile</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentPage === 'settings'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {sidebarOpen && <span className="font-medium">Settings</span>}
                </button>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => alert('Logged out')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span className="font-medium">Log Out</span>}
            </button>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            {sidebarOpen && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="font-semibold mb-1">DREKT Hub</p>
                <p>v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentPage === 'dashboard' && 'Dashboard'}
                {currentPage === 'vision' && 'DREKT VISION'}
                {currentPage === 'network' && 'DREKSTATS'}
                {currentPage === 'inbox' && 'Inbox'}
                {currentPage === 'profile' && 'Profile'}
                {currentPage === 'settings' && 'Settings'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {currentPage === 'dashboard' && (
              <>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search suppliers, products, or cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-96 px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleToggleSortByNearest}
                  disabled={isLocating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
                    sortByNearest
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLocating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Locating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{sortByNearest ? 'Sorted by Distance' : 'Sort by Nearest'}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-sm font-medium">List View</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'map'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-sm font-medium">Map View</span>
                  </button>
                </div>
                <Dropdown
                  label="Cities"
                  items={cityItems}
                  onSelect={handleCitySelect}
                  placeholder="All Cities"
                />
                <Dropdown
                  label="Producers"
                  items={producerItems}
                  onSelect={handleProducerSelect}
                  placeholder="Filter by Product"
                />
                <Dropdown
                  label="Distributors"
                  items={distributorItems}
                  onSelect={handleDistributorSelect}
                  placeholder="Filter by Type"
                />
              </>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-slate-900 p-6">
          {currentPage === 'vision' && <VisionPage />}
          {currentPage === 'network' && <NetworkPage />}
          {currentPage === 'inbox' && <InboxPage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'settings' && <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />}
          {currentPage === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            {hasActiveFilters && (
              <div className="mb-6 dashboard-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Active Filters:
                  </h3>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCity && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      City: {selectedCity}
                      <button
                        onClick={() => clearFilter('city')}
                        className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedProducer && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Producer: {selectedProducer}
                      <button
                        onClick={() => clearFilter('producer')}
                        className="ml-2 hover:text-green-900 dark:hover:text-green-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedDistributor && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Distributor: {selectedDistributor}
                      <button
                        onClick={() => clearFilter('distributor')}
                        className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Suppliers ({filteredBusinesses.length} results)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredBusinesses.length === suppliers.length 
                  ? `Showing all ${suppliers.length} suppliers`
                  : `Filtered from ${suppliers.length} total suppliers`
                }
              </p>
            </div>

            {viewMode === 'map' ? (
              <BusinessMap 
                businesses={filteredBusinesses}
                onLocationChange={(location) => {
                  setUserLocation(location);
                  setSortByNearest(true); // Auto-enable sorting when location is set
                  console.log('📍 Map location synced to dashboard:', location);
                }}
              />
            ) : filteredBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((supplier, index) => (
                  <div
                    key={`${supplier.id}-${index}`}
                    className="dashboard-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/supplier/${supplier.id}`)}
                  >
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {supplier.name}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                          {sortByNearest && userLocation && (
                            <span className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {getDistance(userLocation.lat, userLocation.lng, supplier.latitude, supplier.longitude).toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {supplier.description}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
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
                        <span className="text-gray-700 dark:text-gray-300">{supplier.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{supplier.productCategory}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{supplier.products.length} Products</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{supplier.contactEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{supplier.contactPhone}</span>
                      </div>
                    </div>

                    <button className="mt-4 w-full btn-primary text-sm py-2">
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-card p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No suppliers found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No suppliers match your current filter criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}
