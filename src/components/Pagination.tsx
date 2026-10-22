import { ChevronLeft, ChevronRight } from 'lucide-react'

// Pages affichées : les deux premières, les deux dernières et les voisines de la page courante, « … » entre les trous
function getPageItems(page: number, pageCount: number): (number | 'gap')[] {
  const pages = new Set([1, 2, pageCount - 1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  return sorted.flatMap((p, index) => (index > 0 && p - sorted[index - 1] > 1 ? ['gap' as const, p] : [p]))
}

const ITEM_CLASS = 'flex h-6 min-w-6 items-center justify-center rounded-sm border px-1 text-[11px] font-semibold transition'

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      {page > 1 && (
        <button type="button" onClick={() => onChange(page - 1)} aria-label="Previous page" className={`${ITEM_CLASS} border-card-border text-muted hover:text-black`}>
          <ChevronLeft className="size-3.5" />
        </button>
      )}
      {getPageItems(page, pageCount).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className={`${ITEM_CLASS} border-card-border text-black`}>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`${ITEM_CLASS} ${item === page ? 'border-black text-black' : 'border-card-border text-black hover:border-black/40'}`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className={`${ITEM_CLASS} border-card-border text-muted hover:text-black disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  )
}
