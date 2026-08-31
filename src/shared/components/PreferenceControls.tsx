import { GlobalOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Space, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../app/useTheme'
import { persistLanguage, type AppLanguage } from '../lib/preferences'

export function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation()
  const { mode, toggleTheme } = useTheme()

  const changeLanguage = async () => {
    const next: AppLanguage = i18n.resolvedLanguage === 'ar' ? 'en' : 'ar'
    persistLanguage(next)
    await i18n.changeLanguage(next)
  }

  return (
    <Space size="small">
      <Tooltip title={mode === 'dark' ? t('common.lightMode') : t('common.darkMode')}>
        <Button
          aria-label={mode === 'dark' ? t('common.lightMode') : t('common.darkMode')}
          icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
        />
      </Tooltip>
      <Button icon={<GlobalOutlined />} onClick={() => void changeLanguage()}>
        {compact ? (i18n.resolvedLanguage === 'ar' ? 'EN' : 'ع') : t('common.language')}
      </Button>
    </Space>
  )
}
