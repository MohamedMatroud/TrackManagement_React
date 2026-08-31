import { HttpClient } from '../../../core/api/HttpClient'
import type { PagedResult } from '../../../core/api/types'
import type {
  CreateTrackRequest,
  DistributeTrackRequest,
  DistributionMutationResult,
  Track,
  TrackQuery,
  UpdateTrackStatusRequest,
} from '../types'

export class TrackClient extends HttpClient {
  list(query: TrackQuery, signal?: AbortSignal) {
    return this.get<PagedResult<Track>>('/tracks', {
      signal,
      params: {
        PageNumber: query.pageNumber,
        PageSize: query.pageSize,
        Search: query.search || undefined,
        ArtistId: query.artistId || undefined,
        Genre: query.genre || undefined,
        Status: query.status || undefined,
      },
    })
  }

  getById(id: number, signal?: AbortSignal) {
    return this.get<Track>(`/tracks/${id}`, { signal })
  }

  create(request: CreateTrackRequest) {
    return this.post<Track, CreateTrackRequest>('/tracks', request)
  }

  updateStatus(id: number, request: UpdateTrackStatusRequest) {
    return this.patch<Track, UpdateTrackStatusRequest>(`/tracks/${id}/status`, request)
  }

  distribute(id: number, request: DistributeTrackRequest) {
    return this.post<DistributionMutationResult[], DistributeTrackRequest>(`/tracks/${id}/distribute`, request)
  }
}

export const trackClient = new TrackClient()
