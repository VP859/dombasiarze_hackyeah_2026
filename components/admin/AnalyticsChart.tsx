'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AnalyticsChartProps {
  data: {
    month: string;
    ideas: number;
    applications: number;
    solutions: number;
  }[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <div className="w-full h-72 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Przepływ Innowacji Społecznych w Małopolsce (Cykl Życia)
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} />
          <YAxis stroke="#888888" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
          <Bar dataKey="ideas" name="Fiszki Pomysłów" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="applications" name="Wnioski Grantowe" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="solutions" name="Opublikowane Innowacje" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}