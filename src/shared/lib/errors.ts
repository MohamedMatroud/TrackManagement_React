import type { TFunction } from 'i18next'
import { ApiClientError } from '../../core/api/HttpClient'

export function errorMessage(error: unknown, t: TFunction) {
  if (error instanceof ApiClientError && error.statusCode === 0) return t('errors.network')
  if (error instanceof Error && error.message) return error.message
  return t('common.genericError')
}
