import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { debounce } from './utils'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  /** The value to persist. */
  value: T
  /** Persist function; may be async. */
  onSave: (value: T) => Promise<void> | void
  /** Debounce delay in ms. */
  delay?: number
  /** When true, skip saving (e.g. before initial data has loaded). */
  enabled?: boolean
}

/**
 * Debounced auto-save with a visible status. Flushes any pending save
 * on unmount so nothing is lost when navigating away.
 */
export function useAutoSave<T>({ value, onSave, delay = 800, enabled = true }: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const first = useRef(true)

  const run = useMemo(
    () =>
      debounce(async (v: T) => {
        try {
          setStatus('saving')
          await onSaveRef.current(v)
          setStatus('saved')
        } catch {
          setStatus('error')
        }
      }, delay),
    [delay],
  )

  useEffect(() => {
    // Don't save on the very first render (initial hydration).
    if (first.current) {
      first.current = false
      return
    }
    if (!enabled) return
    run(value)
  }, [value, enabled, run])

  useEffect(() => () => run.flush(), [run])

  const flush = useCallback(() => run.flush(), [run])

  return { status, flush }
}