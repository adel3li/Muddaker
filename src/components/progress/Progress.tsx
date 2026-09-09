import { useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { parseISO, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function Progress() {
  const completedSessions = useAppStore(state => state.completedSessions);

  const chartData = useMemo(() => {
    const countsByMonth: Record<string, { date: Date, count: number }> = {};
    
    // Group completed sessions by month
    Object.keys(completedSessions).forEach(dateString => {
      const date = parseISO(dateString);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!countsByMonth[monthKey]) {
        countsByMonth[monthKey] = { date, count: 0 };
      }
      countsByMonth[monthKey].count += 1;
    });

    // Convert to array and sort chronologically
    const sortedData = Object.values(countsByMonth).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Generate an array spanning the last 6 months to always show a nice chart even if empty
    const result = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(d, 'yyyy-MM');
      
      result.push({
        name: format(d, 'MMMM', { locale: ar }),
        count: countsByMonth[monthKey]?.count || 0,
      });
    }

    return result;
  }, [completedSessions]);

  const totalAyahs = Object.keys(completedSessions).length;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-[22px] font-semibold text-primary mb-2">التقدم</h1>
      <p className="text-[14px] text-textSecondary mb-6">مسيرتك في تدارس القرآن الكريم</p>
      
      {/* Overview Stat */}
      <div className="bg-surface rounded-[24px] p-6 shadow-sm mb-6 flex flex-col items-center justify-center">
        <h2 className="text-[14px] text-textSecondary mb-1">مجموع الآيات المتدارسة</h2>
        <div className="text-[42px] font-bold text-accent font-quran" dir="ltr">{totalAyahs}</div>
        <p className="text-[12px] text-accent/80 mt-1">آية</p>
      </div>

      {/* Chart */}
      <div className="bg-surface rounded-[24px] p-6 shadow-sm">
        <h3 className="text-primary font-semibold mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
          الآيات المنجزة شهرياً
        </h3>
        
        <div className="h-[250px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4A962" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C4A962" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196, 169, 98, 0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#8F9993' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#8F9993' }} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'rgba(196, 169, 98, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'inherit',
                  textAlign: 'right'
                }}
                itemStyle={{ color: '#C4A962', fontWeight: 'bold' }}
                formatter={(value: number) => [value + ' آية', '']}
                labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#C4A962" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                activeDot={{ r: 6, fill: '#C4A962', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
