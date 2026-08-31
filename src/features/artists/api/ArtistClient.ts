import { HttpClient } from '../../../core/api/HttpClient'
import type { Artist } from '../types'

export class ArtistClient extends HttpClient {
  list(signal?: AbortSignal) {
    return this.get<Artist[]>('/artists', { signal })
  }
}

export const artistClient = new ArtistClient()
