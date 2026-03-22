'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Eye, MessageSquare, DollarSign, Package, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const profileViewsData = [
  { day: 'Mar 1', views: 42 }, { day: 'Mar 3', views: 58 }, { day: 'Mar 5', views: 51 },
  { day: 'Mar 7', views: 73 }, { day: 'Mar 9', views: 66 }, { day: 'Mar 11', views: 89 },
  { day: 'Mar 13', views: 95 }, { day: 'Mar 15', views: 81 }, { day: 'Mar 17', views: 104 },
  { day: 'Mar 19', views: 112 }, { day: 'Mar 21', views: 98 }, { day: 'Mar 22', views: 127 },
];

const performanceData = [
  { month: 'January', inputCost: 420000, revenue: 610000 },
  { month: 'February', inputCost: 390000, revenue: 570000 },
  { month: 'March', inputCost: 455000, revenue: 680000 },
];

const freightRateData = [
  { week: 'Jan W1', ratePerCBM: 1850 }, { week: 'Jan W2', ratePerCBM: 1920 },
  { week: 'Jan W3', ratePerCBM: 1880 }, { week: 'Jan W4', ratePerCBM: 2050 },
  { week: 'Feb W1', ratePerCBM: 2100 }, { week: 'Feb W2', ratePerCBM: 1975 },
  { week: 'Feb W3', ratePerCBM: 2230 }, { week: 'Feb W4', ratePerCBM: 2180 },
  { week: 'Mar W1', ratePerCBM: 2310 }, { week: 'Mar W2', ratePerCBM: 2275 },
  { week: 'Mar W3', ratePerCBM: 2400 }, { week: 'Mar W4', ratePerCBM: 2350 },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ title, value, subtitle, trend, trendLabel, icon, loading }: SummaryCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-brand-primary' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          {loading ? (
            <div className="h-7 w-28 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="font-heading font-bold text-2xl text-gray-900">{value}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-accent flex-shrink-0">
          {icon}
        </div>
      </div>
      {trendLabel && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trendLabel}
        </div>
      )}
    </div>
  );
}

// ─── Chart Card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="font-heading font-semibold text-sm text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-medium">{typeof entry.value === 'number' && entry.value > 999
            ? `₱${entry.value.toLocaleString()}`
            : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DrektStatsDashboard() {
  const [usdPhpRate, setUsdPhpRate] = useState<string | null>(null);
  const [rateLoading, setRateLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        const rate: number = data?.rates?.PHP;
        setUsdPhpRate(rate ? `₱${rate.toFixed(2)}` : '—');
      })
      .catch(() => setUsdPhpRate('₱56.41'))
      .finally(() => setRateLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading font-bold text-xl text-gray-900">DrektSTATS</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business performance &amp; market intelligence — updated daily</p>
      </div>

      {/* ── Row 1: Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Profile Views"
          value="1,284"
          subtitle="Last 30 days"
          trend="up"
          trendLabel="+18% vs. last month"
          icon={<Eye className="w-5 h-5" />}
        />
        <SummaryCard
          title="Active Inquiries"
          value="34"
          subtitle="Pending responses"
          trend="up"
          trendLabel="+5 new this week"
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <SummaryCard
          title="USD / PHP Rate"
          value={usdPhpRate ?? '—'}
          subtitle="Live exchange rate"
          trend="neutral"
          trendLabel="Via ExchangeRate-API"
          icon={<DollarSign className="w-5 h-5" />}
          loading={rateLoading}
        />
        <SummaryCard
          title="Active Shipments"
          value="12"
          subtitle="6 in-transit · 6 pending"
          trend="down"
          trendLabel="2 delayed (weather)"
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* ── Row 2: Main Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Chart 1 — Profile Views Line Chart */}
        <ChartCard
          title="Profile Views — Last 30 Days"
          subtitle="Daily unique views on your supplier profile"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={profileViewsData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#16a34a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2 — 3-Month Performance Bar Chart */}
        <ChartCard
          title="3-Month Performance: Input Cost vs. Revenue"
          subtitle="Monthly comparison in Philippine Peso (₱)"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={performanceData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              <Bar dataKey="inputCost" name="Input Cost" fill="#d1fae5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 3: Secondary Chart ─────────────────────────────────────── */}
      <ChartCard
        title="Estimated Domestic Freight Rate Trends"
        subtitle="Weekly average rate per CBM (₱/cbm) — Metro Manila to key regions"
      >
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={freightRateData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={1} />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₱${v.toLocaleString()}`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="ratePerCBM"
              name="₱/CBM"
              stroke="#002db3"
              strokeWidth={2}
              dot={{ r: 3, fill: '#002db3', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-3">
          * Indicative rates based on market data. Actual rates may vary by carrier, route, and cargo type.
        </p>
      </ChartCard>

      {/* ── Data Integrity Notice ──────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
        <span className="text-base leading-none mt-0.5 flex-shrink-0">ℹ️</span>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Data Integrity Notice:</span>{' '}
          Inventory and analytics displayed are exclusively tracked within the DREKT ecosystem. Real-world stock levels may vary if suppliers conduct sales outside of this platform. Auto-sync is currently limited to DREKT-facilitated transactions.
        </p>
      </div>
    </div>
  );
}
