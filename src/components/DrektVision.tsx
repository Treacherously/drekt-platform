'use client';

import dynamic from 'next/dynamic';
import { AlertTriangle, MapPin, Clock, Package, RefreshCw, CheckCircle2, CloudOff } from 'lucide-react';
import { useWeatherAlerts, type WeatherAlert, type AlertSeverity } from '../hooks/useWeatherAlerts';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-sm text-gray-400">Loading map…</p>
    </div>
  ),
});

// ─── Static data (routes + suppliers stay fixed) ─────────────────────────────

const DISRUPTED_ROUTES = [
  { from: 'Pampanga (Central Luzon)', to: 'Metro Manila', reason: 'Weather monitoring active', severity: 'warning' as AlertSeverity },
  { from: 'Iloilo (W. Visayas)', to: 'Cebu Hub', reason: 'Weather monitoring active', severity: 'info' as AlertSeverity },
];

const ACTIVE_SUPPLIERS_ON_MAP = [
  { name: 'San Miguel Yamamura (PKG-001)', city: 'Calamba, Laguna', status: 'Operational' },
  { name: 'NutriAsia Inc.', city: 'Marilao, Bulacan', status: 'Monitoring' },
  { name: 'Selecta Dairy', city: 'Pampanga', status: 'Disrupted' },
];

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<AlertSeverity, { border: string; bg: string; badge: string; badgeText: string; icon: string }> = {
  critical: {
    border: 'border-red-300',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200',
    badgeText: 'CRITICAL',
    icon: 'text-red-500',
  },
  warning: {
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeText: 'WARNING',
    icon: 'text-amber-500',
  },
  info: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-600 border-blue-200',
    badgeText: 'ADVISORY',
    icon: 'text-blue-500',
  },
  clear: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700 border-green-200',
    badgeText: 'CLEAR',
    icon: 'text-green-500',
  },
};

// ─── Skeleton loader card ─────────────────────────────────────────────────────

function AlertCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 animate-pulse space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-28" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="flex gap-4">
        <div className="h-3 bg-gray-100 rounded w-32" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  );
}

// ─── Weather Alert Card ───────────────────────────────────────────────────────

function WeatherAlertCard({ alert }: { alert: WeatherAlert }) {
  const s = SEVERITY_STYLES[alert.severity];
  const Icon = alert.severity === 'clear' ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`border ${s.border} ${s.bg} rounded-lg p-4`}>
      {/* Header row */}
      <div className="flex items-start gap-3 mb-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.icon}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-xs font-bold border rounded px-1.5 py-0.5 ${s.badge}`}>
              {s.badgeText}
            </span>
            <span className="text-xs text-gray-500">{alert.regionCode} — {alert.region}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{alert.title}</p>
        </div>
      </div>

      {/* Detail */}
      <p className="text-xs text-gray-600 leading-relaxed mb-3 ml-7">{alert.detail}</p>

      {/* Meta row */}
      <div className="ml-7 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
        {alert.affectedCargo.length > 0 && (
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            Affected: {alert.affectedCargo.join(', ')}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Est. delay: <strong className="text-gray-700">{alert.delayEstimate}</strong>
        </span>
        {alert.tempC !== undefined && (
          <span className="text-gray-400">{alert.tempC}°C · {alert.windKph} km/h wind</span>
        )}
      </div>

      {/* Footer */}
      <div className="ml-7 mt-2.5 flex items-center justify-between text-xs text-gray-400">
        <span>{alert.source}</span>
        <span>{alert.issuedAt}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DrektVision() {
  const { alerts, loading, error, lastUpdated, refresh } = useWeatherAlerts();

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const actionableAlerts = alerts.filter((a) => a.severity !== 'clear');
  const clearAlerts = alerts.filter((a) => a.severity === 'clear');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-xl text-gray-900">DrektVISION</h1>
          <p className="text-sm text-gray-500 mt-0.5">Supply chain risk intelligence &amp; logistics disruption alerts</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Live data · Last updated {lastUpdated.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })} PHT
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              {warningCount} Warning
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Alerts Feed ────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-gray-900 uppercase tracking-wide">
              Weather Alerts &amp; Advisories
            </h2>
            <span className="text-xs text-gray-400">
              {loading ? 'Fetching…' : `${alerts.length} regions monitored`}
            </span>
          </div>

          {/* Error state */}
          {error && !loading && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex items-start gap-3">
              <CloudOff className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 mb-0.5">Weather data unavailable</p>
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                <button onClick={refresh} className="text-xs text-red-600 underline mt-1.5 hover:text-red-800">Try again</button>
              </div>
            </div>
          )}

          {/* Skeleton loading */}
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <AlertCardSkeleton key={i} />)}
            </div>
          )}

          {/* Live alert cards — actionable first */}
          {!loading && !error && (
            <div className="space-y-3">
              {actionableAlerts.length === 0 && clearAlerts.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No alert data available.</p>
              )}
              {actionableAlerts.map((alert) => (
                <WeatherAlertCard key={alert.id} alert={alert} />
              ))}
              {/* Clear condition cards in a collapsible group */}
              {clearAlerts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-1">Clear Conditions</p>
                  {clearAlerts.map((alert) => (
                    <WeatherAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Map + Route Status ────────────────────────────── */}
        <div className="space-y-4">
          {/* Map container */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-sm text-gray-900 uppercase tracking-wide">
                Logistics Network Map
              </h2>
              <span className="text-xs text-gray-400">Philippines — real-time status</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white" style={{ height: '420px' }}>
              <LeafletMap />
            </div>
            {/* Map legend */}
            <div className="flex items-center gap-4 mt-2 px-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-[#002db3] inline-block" /> Logistics Hub
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-[#16a34a] inline-block" /> Operational
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Monitoring
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Disrupted
              </span>
            </div>
          </div>

          {/* Disrupted Routes */}
          <div>
            <h3 className="font-heading font-semibold text-xs text-gray-500 uppercase tracking-wide mb-2">
              Disrupted Routes
            </h3>
            <div className="space-y-2">
              {DISRUPTED_ROUTES.map((route, i) => {
                const s = SEVERITY_STYLES[route.severity];
                return (
                  <div key={i} className={`border ${s.border} ${s.bg} rounded-lg px-4 py-3 flex items-center gap-3`}>
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${s.icon}`} />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-gray-800">
                        {route.from} <span className="text-gray-400 font-normal mx-1">→</span> {route.to}
                      </p>
                      <p className="text-gray-500 mt-0.5">{route.reason}</p>
                    </div>
                    <span className={`text-xs font-bold border rounded px-1.5 py-0.5 flex-shrink-0 ${s.badge}`}>
                      {s.badgeText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Status */}
          <div>
            <h3 className="font-heading font-semibold text-xs text-gray-500 uppercase tracking-wide mb-2">
              Tracked Supplier Status
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {ACTIVE_SUPPLIERS_ON_MAP.map((s, i) => {
                const dotColor =
                  s.status === 'Operational' ? 'bg-green-500'
                  : s.status === 'Disrupted' ? 'bg-red-500'
                  : 'bg-amber-400';
                const textColor =
                  s.status === 'Operational' ? 'text-green-600'
                  : s.status === 'Disrupted' ? 'text-red-600'
                  : 'text-amber-600';
                return (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.city}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${textColor}`}>
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
