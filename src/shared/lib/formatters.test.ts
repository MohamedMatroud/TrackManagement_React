import { describe, expect, it } from 'vitest'
import { formatDuration, localizedName } from './formatters'

describe('localized formatting', () => {
  it('selects the matching API name', () => {
    const entity = { nameEn: 'Spotify', nameAr: 'سبوتيفاي' }
    expect(localizedName(entity, 'en')).toBe('Spotify')
    expect(localizedName(entity, 'ar')).toBe('سبوتيفاي')
  })

  it('formats track duration consistently', () => {
    expect(formatDuration(185, 'en')).toBe('3:05 min')
    expect(formatDuration(185, 'ar')).toBe('3:05 د')
  })
})
