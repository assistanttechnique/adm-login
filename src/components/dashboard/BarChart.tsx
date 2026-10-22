import type { ChartDatum } from '../../data/dashboardDemo'

const TICKS = [100, 87, 70, 52, 35, 17, 0]

export function BarChart({ data, xLabel, yLabel }: { data: ChartDatum[]; xLabel: string; yLabel: string }) {
  return (
    <div className="w-full">
      <ul className="mb-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-1.5 text-[11px] text-black">
            <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </li>
        ))}
      </ul>

      <div className="flex gap-1.5">
        <span className="flex items-center text-[10px] text-black [writing-mode:vertical-rl] rotate-180">{yLabel}</span>

        <div className="flex flex-1 flex-col">
          <div className="flex h-28 gap-1.5">
            {/* Graduations de l'axe Y */}
            <div className="relative w-7 shrink-0">
              {TICKS.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 translate-y-1/2 text-[9px] text-black"
                  style={{ bottom: `${tick}%` }}
                >
                  {tick}%
                </span>
              ))}
            </div>

            <div className="relative flex-1 border-b border-l border-card-border">
              {TICKS.map((tick) => (
                <span key={tick} className="absolute inset-x-0 border-t border-card-border" style={{ bottom: `${tick}%` }} />
              ))}
              <div className="relative flex h-full items-end justify-around px-[6%]">
                {data.map((d) => (
                  <div
                    key={d.label}
                    title={`${d.label} : ${d.value}%`}
                    className="w-[22%]"
                    style={{ height: `${d.value}%`, backgroundColor: d.color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 pl-9 text-center text-[11px] text-black">{xLabel}</p>
        </div>
      </div>
    </div>
  )
}
