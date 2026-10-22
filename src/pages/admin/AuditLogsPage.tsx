import { Download, Loader2, ScrollText, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ListHeader, StatusMessage } from '../../components/ListPage'
import { Select } from '../../components/Select'
import { DARK_BUTTON_CLASS } from '../../components/formStyles'
import { downloadCsv, toCsv } from '../../utils/csv'
import { formatDateTime } from '../../utils/date'
import { apiErrorMessages, auditLogsApi, type AuditLogDay, type AuditLogFile } from './adminApi'

const CELL = 'px-3 py-3 align-top'

export default function AuditLogsPage() {
  const [files, setFiles] = useState<AuditLogFile[] | null>(null)
  const [selected, setSelected] = useState('')
  const [day, setDay] = useState<AuditLogDay | null>(null)
  const [error, setError] = useState<string[] | null>(null)

  // Charge la liste des fichiers ; le plus récent est affiché par défaut
  useEffect(() => {
    auditLogsApi
      .files()
      .then((list) => {
        setFiles(list)
        if (list.length > 0) setSelected(list[0].name)
      })
      .catch((err) => {
        setFiles([])
        setError(apiErrorMessages(err))
      })
  }, [])

  const selectedDate = files?.find((f) => f.name === selected)?.date

  useEffect(() => {
    if (!selectedDate) return
    let cancelled = false
    auditLogsApi
      .day(selectedDate)
      .then((result) => !cancelled && setDay(result))
      .catch((err) => !cancelled && setError(apiErrorMessages(err)))
    return () => {
      cancelled = true
    }
  }, [selectedDate])

  // Les entrées affichées correspondent-elles au fichier choisi ? (évite d'afficher l'ancien pendant le chargement)
  const current = day && day.file === selected ? day : null

  function exportCsv() {
    if (!current) return
    const rows = current.entries.map((e) => [formatDateTime(new Date(e.timestamp)), `${e.event}: ${e.message}`, e.user, e.ip_address ?? ''])
    downloadCsv(current.file.replace(/\.log$/, '.csv'), toCsv(['Time Stamp', 'Log Message', 'User', 'IP Address'], rows))
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-5">
      <ListHeader icon={ScrollText} title="Audit Logs" />

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div className="w-full max-w-sm">
          <p id="audit-file-label" className="mb-1.5 text-sm font-semibold text-black">
            Select the log file
          </p>
          <Select
            id="audit-file"
            labelId="audit-file-label"
            value={selected}
            options={(files ?? []).map((f) => f.name)}
            placeholder={files === null ? 'Loading…' : 'No log file'}
            onChange={setSelected}
          />
        </div>
        <button type="button" onClick={exportCsv} disabled={!current || current.entries.length === 0} className={`${DARK_BUTTON_CLASS} flex items-center gap-1.5`}>
          <Download className="size-3.5" />
          Export CSV
        </button>
        {current && (
          <p
            role="status"
            className={`flex items-center gap-1.5 text-sm font-semibold ${current.valid ? 'text-green-700' : 'text-form-error'}`}
          >
            {current.valid ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
            {current.valid ? 'Integrity check passed' : 'Integrity check failed: entries were modified or deleted'}
          </p>
        )}
      </div>

      {error && (
        <StatusMessage type="error">
          {error.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </StatusMessage>
      )}

      <div className="relative mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px] text-black">
          <thead className="bg-night-950 text-white">
            <tr>
              <th className="w-44 px-3 py-4 font-semibold">Time Stamp</th>
              <th className="px-3 py-4 font-semibold">Log Message</th>
              <th className="w-40 px-3 py-4 font-semibold">User</th>
              <th className="w-36 px-3 py-4 font-semibold">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {selectedDate && !current && !error && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            )}
            {current?.entries.map((entry) => (
              <tr key={entry.id} className="border-b border-card-border">
                <td className={`${CELL} whitespace-nowrap`}>{formatDateTime(new Date(entry.timestamp))}</td>
                <td className={CELL}>
                  <span className="font-semibold">{entry.event}</span>
                  <span className="block text-ink/80">{entry.message}</span>
                </td>
                <td className={CELL}>{entry.user}</td>
                <td className={CELL}>{entry.ip_address ?? '—'}</td>
              </tr>
            ))}
            {files?.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted">
                  No audit log yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Filigrane « Valid » / « Invalid » comme dans la démo ADM (purement visuel, le statut est annoncé plus haut) */}
        {current && current.entries.length > 0 && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] text-[120px] font-bold tracking-widest select-none ${
              current.valid ? 'text-green-600/15' : 'text-red-600/20'
            }`}
          >
            {current.valid ? 'Valid' : 'Invalid'}
          </span>
        )}
      </div>
    </div>
  )
}
