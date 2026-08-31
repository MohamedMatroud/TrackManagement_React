import type { AppLanguage } from './preferences'

export interface LocalizedEntity {
  nameEn: string
  nameAr: string
}

export function localizedName(entity: LocalizedEntity, language: AppLanguage) {
  return language === 'ar' ? entity.nameAr : entity.nameEn
}

function localeFor(language: AppLanguage) {
  return language === 'ar' ? 'ar-EG' : 'en-US'
}

export function formatDate(value: string, language: AppLanguage) {
  return new Intl.DateTimeFormat(localeFor(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string, language: AppLanguage) {
  return new Intl.DateTimeFormat(localeFor(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatNumber(value: number, language: AppLanguage) {
  return new Intl.NumberFormat(localeFor(language)).format(value)
}

export function formatDuration(totalSeconds: number, language: AppLanguage) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const value = `${minutes}:${String(seconds).padStart(2, '0')}`
  return language === 'ar' ? `${value} د` : `${value} min`
}
