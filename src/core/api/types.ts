export interface ApiErrorPayload {
  code: number
  message: string | null
}

export interface ApiResponse<T> {
  success: boolean
  error: ApiErrorPayload | null
  message: string | null
  data: T | null
  statusCode: number
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}
