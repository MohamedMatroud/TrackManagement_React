export const preferenceKeys = {
  theme: 'trackline.theme',
  language: 'trackline.language',
} as const

export type AppLanguage = 'en' | 'ar'

export function getPreferredLanguage(): AppLanguage {
  const saved = localStorage.getItem(preferenceKeys.language)
  if (saved === 'ar' || saved === 'en') return saved
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

export function persistLanguage(language: AppLanguage) {
  localStorage.setItem(preferenceKeys.language, language)
}
