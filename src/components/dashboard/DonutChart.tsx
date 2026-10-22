import type { ChartDatum } from '../../data/dashboardDemo'

const SIZE = 140
const CENTER = SIZE / 2
const RADIUS = 50
const STROKE = 30
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function DonutChart({ title, data }: { title: string; data: ChartDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  // Le premier segment est centré en haut de l'anneau, comme sur la maquette
  const startAngle = -90 - (data[0].value / total) * 180

  const segments = data.map((d, index) => {
    const offset = data.slice(0, index).reduce((sum, prev) => sum + prev.value, 0)
    const length = (d.value / total) * CIRCUMFERENCE
    const midAngle = ((startAngle + ((offset + d.value / 2) / total) * 360) * Math.PI) / 180
    return {
      ...d,
      length,
      dashOffset: -(offset / total) * CIRCUMFERENCE,
      labelX: CENTER + RADIUS * Math.cos(midAngle),
      labelY: CENTER + RADIUS * Math.sin(midAngle),
      percent: Math.round((d.value / total) * 100),
    }
  })

  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div>
        <h3 className="mb-3 text-lg font-bold text-night-950 uppercase">{title}</h3>
        <ul className="space-y-2">
          {data.map((d) => (
            <li key={d.label} className="flex items-center gap-2.5 text-[13px] text-black">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </li>
          ))}
        </ul>
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-32 shrink-0" role="img" aria-label={title}>
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeDasharray={`${s.length} ${CIRCUMFERENCE - s.length}`}
            strokeDashoffset={s.dashOffset}
            transform={`rotate(${startAngle} ${CENTER} ${CENTER})`}
          />
        ))}
        {segments.map((s) => (
          <text
            key={`${s.label}-label`}
            x={s.labelX}
            y={s.labelY}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-[11px] font-bold"
          >
            {s.percent}%
          </text>
        ))}
      </svg>
    </div>
  )
}
