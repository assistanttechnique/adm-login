import { useCallback, useRef, useState } from 'react'

// État local d'une liste d'éléments identifiés par un id (CRUD de base partagé par les stores du front)
export function useCollection<T extends { id: number }>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial)
  const nextId = useRef(Math.max(0, ...initial.map((item) => item.id)) + 1)

  // Ajoute l'élément et renvoie son id
  const create = useCallback((values: Omit<T, 'id'>) => {
    const id = nextId.current++
    setItems((list) => [...list, { ...values, id } as T])
    return id
  }, [])

  const update = useCallback(
    (id: number, values: Partial<Omit<T, 'id'>>) =>
      setItems((list) => list.map((item) => (item.id === id ? { ...item, ...values } : item))),
    [],
  )

  const remove = useCallback((ids: number[]) => setItems((list) => list.filter((item) => !ids.includes(item.id))), [])

  return { items, create, update, remove }
}
