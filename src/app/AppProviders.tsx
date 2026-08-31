import { useEffect, type ReactNode } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import arEG from 'antd/es/locale/ar_EG'
import enUS from 'antd/es/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import 'dayjs/locale/en'
import { BrowserRouter } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider } from '../features/auth/state/AuthProvider'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'
import './i18n'

function DesignSystemProvider({ children }: { children: ReactNode }) {
  const { mode } = useTheme()
  const { i18n } = useTranslation()
  const isArabic = i18n.resolvedLanguage === 'ar'

  useEffect(() => {
    const language = isArabic ? 'ar' : 'en'
    document.documentElement.lang = language
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
    dayjs.locale(language)
  }, [isArabic])

  return (
    <ConfigProvider
      direction={isArabic ? 'rtl' : 'ltr'}
      locale={isArabic ? arEG : enUS}
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: mode === 'dark' ? '#8b7aff' : '#6757e7',
          colorInfo: '#6757e7',
          colorSuccess: '#18a877',
          colorWarning: '#e3a323',
          colorError: '#e25768',
          borderRadius: 12,
          borderRadiusLG: 18,
          fontFamily: isArabic ? 'Tahoma, Arial, sans-serif' : 'Inter, ui-sans-serif, system-ui, sans-serif',
        },
        components: {
          Button: { controlHeight: 42, fontWeight: 650 },
          Input: { controlHeight: 42 },
          Select: { controlHeight: 42 },
          Card: { headerBg: 'transparent' },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DesignSystemProvider>
        <AuthProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </AuthProvider>
      </DesignSystemProvider>
    </ThemeProvider>
  )
}
