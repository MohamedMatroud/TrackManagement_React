import { useCallback, useEffect, useState, type DependencyList } from 'react'

interface AsyncResource<T> {
  data: T | null
  error: Error | null
  loading: boolean
  refreshing: boolean
  refresh: () => void
}

export function useAsyncResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  dependencies: DependencyList,
): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [revision, setRevision] = useState(0)

  const refresh = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setError(null)
    setLoading((current) => (data === null ? true : current))
    setRefreshing(data !== null)

    void loader(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason : new Error('The request failed.'))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
          setRefreshing(false)
        }
      })

    return () => controller.abort()
    // The caller supplies the exact values that invalidate this resource.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, revision])

  return { data, error, loading, refreshing, refresh }
}
