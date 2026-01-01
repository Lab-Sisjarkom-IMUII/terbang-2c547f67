import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Sen', sales: 45 },
  { day: 'Sel', sales: 52 },
  { day: 'Rab', sales: 48 },
  { day: 'Kam', sales: 61 },
  { day: 'Jum', sales: 55 },
  { day: 'Sab', sales: 70 },
  { day: 'Min', sales: 65 },
];

const SalesChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.1)" />
        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--primary) / 0.2)',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;

