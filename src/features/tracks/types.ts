export interface TrackDistribution {
  id: number
  dspId: string
  dspCode: string
  dspNameEn: string
  dspNameAr: string
  submittedAt: string
  statusId: string
  statusCode: string
  statusNameEn: string
  statusNameAr: string
}

export interface Track {
  id: number
  title: string
  isrc: string
  artistId: number
  artistName: string
  trackStatusId: string
  trackStatusCode: string
  trackStatusNameEn: string
  trackStatusNameAr: string
  album: string | null
  genre: string | null
  durationSeconds: number
  releaseDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  dspAssignmentsCount: number
  distributions: TrackDistribution[]
}

export interface TrackQuery {
  pageNumber: number
  pageSize: number
  search?: string
  artistId?: number
  genre?: string
  status?: string
}

export interface CreateTrackRequest {
  title: string
  artistId: number
  isrc: string
  album?: string | null
  genre?: string | null
  durationSeconds: number
  releaseDate: string
}

export interface UpdateTrackStatusRequest {
  trackStatusId: string
}

export interface DistributeTrackRequest {
  dspIds: string[]
}

export interface DistributionMutationResult {
  id: number
  trackId: number
  trackTitle: string
  dspId: string
  dspCode: string
  dspNameEn: string
  dspNameAr: string
  submittedAt: string
  trackDistributionStatusId: string
  statusCode: string
}
