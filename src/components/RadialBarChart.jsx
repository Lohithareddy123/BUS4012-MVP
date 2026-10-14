import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'

/**
 * RadialBarChart — Adapted from 21st.dev radial chart component.
 *
 * Displays concentric radial bars representing decision metrics.
 * Adapted for ResolvePath's plain CSS / JS architecture (no Tailwind/TS).
 *
 * Props:
 *   data — array of { name: string, value: number (0-100), fill: string }
 */

// Custom legend renderer
function CustomLegend({ payload }) {
  return (
    <div className="radial-legend">
      {payload &&
        payload.map((entry, index) => (
          <div className="radial-legend-item" key={index}>
            <span
              className="radial-legend-dot"
              style={{ backgroundColor: entry.color }}
            />
            <span className="radial-legend-name">{entry.value}</span>
          </div>
        ))}
    </div>
  )
}

// Custom label for the center of the chart
function CenterLabel({ viewBox, maxScore }) {
  const { cx, cy } = viewBox
  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        className="radial-center-value"
      >
        {maxScore}%
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        dominantBaseline="central"
        className="radial-center-label"
      >
        Top Score
      </text>
    </g>
  )
}

function RadialBarChart({ data }) {
  if (!data || data.length === 0) return null

  // Recharts expects data in a specific format — wrap in array with a single object
  // where each key maps to a radial bar value
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: item.fill,
  }))

  // Find max score for center display
  const maxScore = Math.max(...data.map((d) => d.value))

  return (
    <div className="radial-chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="25%"
          outerRadius="90%"
          barSize={14}
          data={chartData}
          startAngle={180}
          endAngle={-180}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            angleAxisId={0}
          />
          <RadialBar
            background={{ fill: 'rgba(0,0,0,0.04)' }}
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
            isAnimationActive={true}
            animationDuration={800}
          />
        </RechartsRadialBarChart>
      </ResponsiveContainer>

      {/* Center label overlay */}
      <div className="radial-center-overlay">
        <div className="radial-center-value">{maxScore}%</div>
        <div className="radial-center-label">Top Score</div>
      </div>

      {/* Custom legend */}
      <div className="radial-legend">
        {data.map((item, index) => (
          <div className="radial-legend-item" key={index}>
            <span
              className="radial-legend-dot"
              style={{ backgroundColor: item.fill }}
            />
            <span className="radial-legend-name">
              {item.name}
            </span>
            <span className="radial-legend-value">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RadialBarChart