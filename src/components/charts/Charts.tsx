import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'

const gridColor = 'currentColor'
const axisTick = { fontSize: 11, fill: 'currentColor' }

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs shadow-popover dark:border-ink-700 dark:bg-ink-900">
      <p className="font-medium text-ink-500 dark:text-ink-400">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold text-ink-800 dark:text-ink-100">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export function TrendArea({ data, dataKey = 'value', color = '#6c5cf5', height = 220 }: { data: any[]; dataKey?: string; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="text-ink-100 dark:text-ink-800" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={axisTick} className="text-ink-400" tickLine={false} axisLine={false} />
        <YAxis tick={axisTick} className="text-ink-400" tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MultiLineTrend({ data, lines, height = 260 }: { data: any[]; lines: { key: string; color: string; name: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="text-ink-100 dark:text-ink-800" stroke={gridColor} vertical={false} />
        <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ComparisonBars({ data, dataKey = 'value', color = '#6c5cf5', height = 220, layout = 'horizontal' }: { data: any[]; dataKey?: string; color?: string; height?: number; layout?: 'horizontal' | 'vertical' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 5, right: 8, left: layout === 'vertical' ? 40 : -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="text-ink-100 dark:text-ink-800" stroke={gridColor} vertical={layout === 'vertical'} horizontal={layout === 'horizontal'} />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={axisTick} tickLine={false} axisLine={false} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={false} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} />
          </>
        )}
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(108,92,245,0.06)' }} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const donutColors = ['#6c5cf5', '#23ae80', '#e6a23c', '#3f9bdc', '#e6595f', '#c95bd8']

export function Donut({ data, height = 220 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
