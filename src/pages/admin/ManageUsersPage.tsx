import { Loader2, Users } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import type { Role } from '../../auth/AuthContext'
import { useAuth } from '../../auth/useAuth'
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { ModalActions } from '../../components/FormFields'
import { ListHeader, RowActions, StatusMessage } from '../../components/ListPage'
import { Modal } from '../../components/Modal'
import { DARK_BUTTON_CLASS, MODAL_FIELD_CLASS, MODAL_LABEL_CLASS } from '../../components/formStyles'
import { formatDateTime } from '../../utils/date'
import { apiErrorMessages, usersApi, type ManagedUser, type ManagedUserInput } from './adminApi'

const CELL = 'px-3 py-3 align-middle'
const ROLE_LABELS: Record<Role, string> = { admin: 'Administrator', user: 'User' }

type DialogState = { mode: 'create' } | { mode: 'edit'; user: ManagedUser } | null
type Feedback = { type: 'success' | 'error'; lines: string[] } | null

const EMPTY_USER: ManagedUserInput = { username: '', email: '', first_name: '', last_name: '', role: 'user', is_active: true, password: '' }

function UserForm({ user, isSelf, onSaved, onCancel }: {
  user?: ManagedUser
  isSelf: boolean
  onSaved: (saved: ManagedUser) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<ManagedUserInput>(user ? { ...user, password: '' } : EMPTY_USER)
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function update<K extends keyof ManagedUserInput>(field: K, value: ManagedUserInput[K]) {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors([])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values.username.trim()) return setErrors(['Username is required.'])
    if (!user && !values.password) return setErrors(['A password is required for a new user.'])
    if (values.password !== confirmation) return setErrors(['The two passwords do not match.'])

    setSaving(true)
    try {
      const payload = { ...values, username: values.username.trim(), email: values.email.trim() }
      onSaved(user ? await usersApi.update(user.id, payload) : await usersApi.create(payload))
    } catch (error) {
      setErrors(apiErrorMessages(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="user-username" className={MODAL_LABEL_CLASS}>
          Username <span className="text-form-required">*</span>
        </label>
        <input id="user-username" value={values.username} onChange={(e) => update('username', e.target.value)} className={MODAL_FIELD_CLASS} autoFocus />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="user-first-name" className={MODAL_LABEL_CLASS}>
            First name
          </label>
          <input id="user-first-name" value={values.first_name} onChange={(e) => update('first_name', e.target.value)} className={MODAL_FIELD_CLASS} />
        </div>
        <div>
          <label htmlFor="user-last-name" className={MODAL_LABEL_CLASS}>
            Last name
          </label>
          <input id="user-last-name" value={values.last_name} onChange={(e) => update('last_name', e.target.value)} className={MODAL_FIELD_CLASS} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="user-email" className={MODAL_LABEL_CLASS}>
            E-mail
          </label>
          <input id="user-email" type="email" value={values.email} onChange={(e) => update('email', e.target.value)} className={MODAL_FIELD_CLASS} />
        </div>
        <div>
          <label htmlFor="user-role" className={MODAL_LABEL_CLASS}>
            Role
          </label>
          {/* Un administrateur ne peut pas se retirer ses propres droits (contrôlé aussi côté serveur) */}
          <select id="user-role" value={values.role} disabled={isSelf} onChange={(e) => update('role', e.target.value as Role)} className={MODAL_FIELD_CLASS}>
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <option key={role} value={role}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="user-password" className={MODAL_LABEL_CLASS}>
            Password {!user && <span className="text-form-required">*</span>}
          </label>
          <input
            id="user-password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder={user ? 'Leave blank to keep the current one' : ''}
            className={MODAL_FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="user-password-confirmation" className={MODAL_LABEL_CLASS}>
            Confirm password
          </label>
          <input
            id="user-password-confirmation"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value)
              setErrors([])
            }}
            className={MODAL_FIELD_CLASS}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-black">
        <input
          type="checkbox"
          checked={values.is_active}
          disabled={isSelf}
          onChange={(e) => update('is_active', e.target.checked)}
          className="size-4 accent-night-950"
        />
        Active account
      </label>
      {errors.length > 0 && (
        <div role="alert" className="space-y-1 text-sm text-form-error">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      {saving ? (
        <p className="flex items-center justify-end gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" /> Saving…
        </p>
      ) : (
        <ModalActions submitLabel={user ? 'Update' : 'Create'} onCancel={onCancel} />
      )}
    </form>
  )
}

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ManagedUser[] | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [toDelete, setToDelete] = useState<ManagedUser | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch((error) => {
        setUsers([])
        setFeedback({ type: 'error', lines: apiErrorMessages(error) })
      })
  }, [])

  function handleSaved(saved: ManagedUser) {
    const exists = users?.some((u) => u.id === saved.id)
    setUsers((list) => (exists ? (list ?? []).map((u) => (u.id === saved.id ? saved : u)) : [...(list ?? []), saved]))
    setFeedback({ type: 'success', lines: [`User "${saved.username}" ${exists ? 'updated' : 'created'}.`] })
    setDialog(null)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await usersApi.remove(toDelete.id)
      setUsers((list) => (list ?? []).filter((u) => u.id !== toDelete.id))
      setFeedback({ type: 'success', lines: [`User "${toDelete.username}" deleted.`] })
    } catch (error) {
      setFeedback({ type: 'error', lines: apiErrorMessages(error) })
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-5">
      <ListHeader icon={Users} title="Manage Users">
        <button type="button" onClick={() => setDialog({ mode: 'create' })} className={DARK_BUTTON_CLASS}>
          Create User
        </button>
      </ListHeader>

      {feedback && (
        <StatusMessage type={feedback.type}>
          {feedback.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </StatusMessage>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px] text-black">
          <thead className="bg-night-950 text-white">
            <tr>
              <th className="px-3 py-4 font-semibold">Username</th>
              <th className="px-3 py-4 font-semibold">Full Name</th>
              <th className="px-3 py-4 font-semibold">E-mail</th>
              <th className="px-3 py-4 font-semibold">Role</th>
              <th className="px-3 py-4 font-semibold">Status</th>
              <th className="px-3 py-4 font-semibold">Last Login</th>
              <th className="w-24 px-3 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {users === null && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            )}
            {users?.map((user) => {
              const isSelf = user.id === currentUser?.id
              return (
                <tr key={user.id} className="border-b border-card-border">
                  <td className={`${CELL} font-medium`}>
                    {user.username}
                    {isSelf && <span className="ml-2 rounded-full bg-lilac/15 px-2 py-0.5 text-[11px] font-semibold text-accent-600">You</span>}
                  </td>
                  <td className={CELL}>{user.full_name}</td>
                  <td className={CELL}>{user.email || '—'}</td>
                  <td className={CELL}>{ROLE_LABELS[user.role]}</td>
                  <td className={CELL}>
                    <span className={user.is_active ? 'text-green-700' : 'text-muted'}>{user.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className={`${CELL} whitespace-nowrap`}>{user.last_login ? formatDateTime(new Date(user.last_login)) : 'Never'}</td>
                  <td className={CELL}>
                    <RowActions
                      label={user.username}
                      onEdit={() => setDialog({ mode: 'edit', user })}
                      onDelete={isSelf ? undefined : () => setToDelete(user)}
                    />
                  </td>
                </tr>
              )
            })}
            {users?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
                  No user found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {dialog && (
        <Modal title={dialog.mode === 'edit' ? 'Edit User' : 'Create User'} onClose={() => setDialog(null)}>
          <UserForm
            user={dialog.mode === 'edit' ? dialog.user : undefined}
            isSelf={dialog.mode === 'edit' && dialog.user.id === currentUser?.id}
            onSaved={handleSaved}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDeleteModal title="Delete User" onConfirm={confirmDelete} onClose={() => setToDelete(null)}>
          <strong>{toDelete.username}</strong>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
