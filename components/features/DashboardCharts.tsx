'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function DashboardCharts() {
  const activityData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Mock data for 7-day activity. In a real app, calculate this from completed tasks.
    return days.map(day => ({
      name: day,
      hours: Math.floor(Math.random() * 5) + 1,
    }));
  }, []);

  const categoryData = useMemo(() => {
    return [
      { name: 'Academics', value: 40 },
      { name: 'Projects', value: 30 },
      { name: 'Revision', value: 20 },
      { name: 'Extracurricular', value: 10 },
    ];
  }, []);

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'];

  return (
    <div className="col-span-1 md:col-span-2 w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-background border rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">7-Day Study Activity</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
              />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-background border rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Focus Distribution</h4>
        <div className="h-[250px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
