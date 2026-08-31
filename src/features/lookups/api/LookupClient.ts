import { HttpClient } from '../../../core/api/HttpClient'
import type { LookupItem } from '../types'

export class LookupClient extends HttpClient {
  trackStatuses(signal?: AbortSignal) {
    return this.get<LookupItem[]>('/lookups/track-statuses', { signal })
  }

  distributionStatuses(signal?: AbortSignal) {
    return this.get<LookupItem[]>('/lookups/track-distribution-statuses', { signal })
  }
}

export const lookupClient = new LookupClient()
