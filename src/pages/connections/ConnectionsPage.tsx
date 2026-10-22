import { SquarePen, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { Modal } from '../../components/Modal'
import { ConnectionForm } from './ConnectionForm'
import type { Connection, ConnectionInput } from './connectionsData'
import { useConnections } from './useConnections'

type Filters = Pick<Connection, 'name' | 'type' | 'subType'>

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; connection: Connection }
  | { mode: 'delete'; connection: Connection }
  | null

const COLUMNS = ['Connection Name', 'Connection Type', 'Sub Type', 'File Share', 'Description', 'Modified By', 'Modified Date', 'Action']

const FILTERS: { key: keyof Filters; placeholder: string }[] = [
  { key: 'name', placeholder: 'Search by Connection' },
  { key: 'type', placeholder: 'Search by Connection' },
  { key: 'subType', placeholder: 'Search by Sub type' },
]

const CELL = 'px-2 py-2.5'

export default function ConnectionsPage() {
  const { connections, createConnection, updateConnection, deleteConnection } = useConnections()
  const [filters, setFilters] = useState<Filters>({ name: '', type: '', subType: '' })
  const [dialog, setDialog] = useState<DialogState>(null)

  const visible = connections.filter((connection) =>
    FILTERS.every(({ key }) => connection[key].toLowerCase().includes(filters[key].trim().toLowerCase())),
  )

  const closeDialog = () => setDialog(null)

  function handleCreate(values: ConnectionInput) {
    createConnection(values)
    closeDialog()
  }

  function handleUpdate(id: number, values: ConnectionInput) {
    updateConnection(id, values)
    closeDialog()
  }

  function handleDelete(id: number) {
    deleteConnection(id)
    closeDialog()
  }

  return (
    <div className="rounded-sm bg-[#f9f9fa] p-3 sm:p-5">
      <div className="rounded-sm bg-white p-4 sm:p-5">
        <h1 className="text-sm font-bold text-black">Connections List</h1>
        <button
          type="button"
          onClick={() => setDialog({ mode: 'create' })}
          className="mt-3 rounded-md bg-night-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-800"
        >
          Create Connection
        </button>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs text-black">
            <thead>
              <tr className="bg-content text-[11px] font-bold text-[#555]">
                {COLUMNS.map((column) => (
                  <th key={column} className={`${CELL} font-bold`}>
                    {column}
                  </th>
                ))}
              </tr>
              <tr className="bg-content/60">
                {COLUMNS.map((column, index) => {
                  const filter = FILTERS[index]
                  return (
                    <th key={column} className="px-2 pb-2">
                      {filter && (
                        <input
                          value={filters[filter.key]}
                          onChange={(e) => setFilters((f) => ({ ...f, [filter.key]: e.target.value }))}
                          placeholder={filter.placeholder}
                          aria-label={filter.placeholder}
                          className="w-full rounded-sm border border-card-border bg-white px-2 py-1 text-[10px] font-normal outline-none focus:border-lilac"
                        />
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map((connection) => (
                <tr key={connection.id} className="border-b border-card-border hover:bg-content/50">
                  <td className={CELL}>{connection.name}</td>
                  <td className={CELL}>{connection.type}</td>
                  <td className={CELL}>{connection.subType}</td>
                  <td className={CELL}>{connection.fileShare}</td>
                  <td className={`${CELL} max-w-60 truncate`} title={connection.description}>
                    {connection.description}
                  </td>
                  <td className={CELL}>{connection.modifiedBy}</td>
                  <td className={`${CELL} whitespace-nowrap`}>{connection.modifiedDate}</td>
                  <td className={CELL}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: 'edit', connection })}
                        aria-label={`Edit ${connection.name}`}
                        className="rounded p-0.5 text-night-950 transition hover:text-lilac"
                      >
                        <SquarePen className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: 'delete', connection })}
                        aria-label={`Delete ${connection.name}`}
                        className="rounded p-0.5 text-night-950 transition hover:text-form-error"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-2 py-8 text-center text-muted">
                    No connection found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {dialog?.mode === 'create' && (
        <Modal title="Create Connection" onClose={closeDialog}>
          <ConnectionForm submitLabel="Create" onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog?.mode === 'edit' && (
        <Modal title="Edit Connection" onClose={closeDialog}>
          <ConnectionForm
            initial={dialog.connection}
            submitLabel="Save"
            onSubmit={(values) => handleUpdate(dialog.connection.id, values)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.mode === 'delete' && (
        <ConfirmDeleteModal title="Delete Connection" onConfirm={() => handleDelete(dialog.connection.id)} onClose={closeDialog}>
          <strong>{dialog.connection.name}</strong>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
