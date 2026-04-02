import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getSourceRelevanceScores, CATEGORY_COLORS } from '../lib/chartHelpers';

// Wine-to-light gradient palette for bars
const BAR_COLORS = [
  '#722f37',
  '#7d3540',
  '#8b3a45',
  '#99404b',
  '#a05060',
  '#b06070',
  '#c27a85',
  '#d4a0a8',
  '#e0b8be',
  '#ecd0d4',
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const { score, count } = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Relevance score: <span className="text-foreground font-medium">{score.toFixed(2)}</span>
      </p>
      <p className="text-muted-foreground text-xs mt-0.5">
        (lower = more relevant) · {count} article{count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// Truncate long source names for the Y axis
function truncate(str, n = 18) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function SourceRelevanceChart({ articles }) {
  const data = getSourceRelevanceScores(articles);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No source data yet — fetch some news first
      </div>
    );
  }

  // Chart height scales with number of sources (min 240, max 420)
  const chartHeight = Math.max(240, Math.min(420, data.length * 42));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        barCategoryGap="28%"
      >
        <CartesianGrid
          horizontal={false}
          strokeDasharray="3 3"
          stroke="rgba(114,47,55,0.1)"
        />
        <XAxis
          type="number"
          domain={[0, 1]}
          tickCount={5}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(2)}
        />
        <YAxis
          type="category"
          dataKey="source"
          width={130}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => truncate(v)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(114,47,55,0.06)' }} />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={BAR_COLORS[index % BAR_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
