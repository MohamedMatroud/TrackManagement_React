import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { clearSession, readSession } from '../../features/auth/state/sessionStore'
import { getPreferredLanguage } from '../../shared/lib/preferences'
import type { ApiResponse } from './types'

export class ApiClientError extends Error {
  readonly statusCode: number
  override readonly cause?: unknown

  constructor(
    message: string,
    statusCode = 0,
    cause?: unknown,
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.cause = cause
  }
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const session = readSession()
  const language = getPreferredLanguage()
  config.headers.set('Accept-Language', language === 'ar' ? 'ar-EG' : 'en')
  if (session?.accessToken) config.headers.set('Authorization', `Bearer ${session.accessToken}`)
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const statusCode = error.response?.status ?? 0
    const requestUrl = error.config?.url ?? ''
    if (statusCode === 401 && !requestUrl.includes('/auth/token')) clearSession()

    const apiMessage = error.response?.data?.error?.message ?? error.response?.data?.message
    const fallback = statusCode === 0 ? 'Unable to reach the API. Check that the service is running.' : error.message
    return Promise.reject(new ApiClientError(apiMessage || fallback, statusCode, error))
  },
)

export abstract class HttpClient {
  protected readonly client: AxiosInstance

  constructor(client: AxiosInstance = axiosClient) {
    this.client = client
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return this.unwrap(response.data)
  }

  protected async post<T, TBody = unknown>(url: string, body?: TBody, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, body, config)
    return this.unwrap(response.data)
  }

  protected async patch<T, TBody = unknown>(url: string, body?: TBody, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, body, config)
    return this.unwrap(response.data)
  }

  protected unwrap<T>(response: ApiResponse<T>): T {
    if (!response.success || response.data === null) {
      throw new ApiClientError(response.error?.message || response.message || 'The API request failed.', response.statusCode)
    }
    return response.data
  }
}
