import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { getNewsTrend } from '../lib/chartHelpers';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} article{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
}

export function TrendChart({ articles }) {
  const data = getNewsTrend(articles, 'hour');

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No trend data yet — fetch some news first
      </div>
    );
  }

  // If all articles are within same hour, group by minute instead for variety
  const displayData = data.length === 1
    ? getNewsTrend(articles, 'day').length > 0
      ? getNewsTrend(articles, 'day')
      : data
    : data;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="wineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#722f37" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#722f37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(114,47,55,0.1)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#722f37"
          strokeWidth={2.5}
          fill="url(#wineGradient)"
          dot={{ fill: '#722f37', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#722f37' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
