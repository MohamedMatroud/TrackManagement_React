import {
  LockOutlined,
  SafetyCertificateOutlined,
  SoundOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { App as AntdApp, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PreferenceControls } from '../../../shared/components/PreferenceControls'
import { errorMessage } from '../../../shared/lib/errors'
import { useAuth } from '../state/useAuth'
import type { LoginRequest } from '../types'

const { Title, Text } = Typography

interface LoginLocationState {
  from?: string
}

export function LoginPage() {
  const { t } = useTranslation()
  const { isAuthenticated, login } = useAuth()
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/tracks" replace />

  const onFinish = async (values: LoginRequest) => {
    setSubmitting(true)
    try {
      await login(values)
      message.success(t('auth.success'))
      const destination = (location.state as LoginLocationState | null)?.from || '/tracks'
      navigate(destination, { replace: true })
    } catch (error) {
      message.error(errorMessage(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-showcase" aria-label={t('auth.headline')}>
        <div className="brand-mark">
          <span className="brand-mark-icon" aria-hidden="true"><SoundOutlined /></span>
          <span>{t('common.productName')}</span>
        </div>

        <div className="showcase-copy">
          <span className="eyebrow">{t('auth.eyebrow')}</span>
          <h1>{t('auth.headline')}</h1>
          <p>{t('auth.description')}</p>
        </div>

        <div className="showcase-metrics" aria-label="Catalog overview">
          <span><strong>3+</strong>{t('auth.artists')}</span>
          <span><strong>8+</strong>{t('auth.tracks')}</span>
          <span><strong>8</strong>{t('auth.destinations')}</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-toolbar">
          <PreferenceControls />
        </div>

        <div className="login-form-wrap">
          <Card className="login-card app-surface" variant="borderless">
            <Space orientation="vertical" size={4} className="mb-7">
              <Text className="eyebrow">{t('common.productName')}</Text>
              <Title level={2} className="!mb-1 !mt-2">{t('auth.welcome')}</Title>
              <Text type="secondary">{t('auth.subtitle')}</Text>
            </Space>

            <Form<LoginRequest> layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="username"
                label={t('auth.username')}
                rules={[{ required: true, whitespace: true, message: t('auth.requiredUsername') }]}
              >
                <Input prefix={<UserOutlined />} placeholder={t('auth.usernamePlaceholder')} autoComplete="username" />
              </Form.Item>
              <Form.Item
                name="password"
                label={t('auth.password')}
                rules={[{ required: true, message: t('auth.requiredPassword') }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} block className="mt-2">
                {t('auth.signIn')}
              </Button>
            </Form>

            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <SafetyCertificateOutlined />
              <span>{t('auth.secure')}</span>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}
