import { HttpClient } from '../../../core/api/HttpClient'
import type { DistributionCount } from '../types'

export class DistributionClient extends HttpClient {
  count(signal?: AbortSignal) {
    return this.get<DistributionCount>('/track-distributions/count', { signal })
  }
}

export const distributionClient = new DistributionClient()
