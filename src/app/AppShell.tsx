import {
  CustomerServiceOutlined,
  LogoutOutlined,
  MenuOutlined,
  SoundOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Drawer, Grid, Layout, Menu, Space, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/state/useAuth'
import { PreferenceControls } from '../shared/components/PreferenceControls'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export function AppShell() {
  const { t, i18n } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const screens = Grid.useBreakpoint()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const selectedKey = location.pathname.startsWith('/tracks') ? '/tracks' : location.pathname

  const menuItems = [
    {
      key: '/tracks',
      icon: <CustomerServiceOutlined />,
      label: t('nav.tracks'),
    },
  ]

  const navigateFromMenu = ({ key }: { key: string }) => {
    navigate(key)
    setMobileMenuOpen(false)
  }

  const sidebar = (
    <div className="sidebar-inner">
      <button type="button" className="app-brand" onClick={() => navigate('/tracks')}>
        <span className="app-brand-icon"><SoundOutlined /></span>
        <span>
          <strong>{t('common.productName')}</strong>
          <small>{t('nav.workspace')}</small>
        </span>
      </button>

      <div className="nav-label">{t('nav.operations')}</div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={navigateFromMenu}
        className="app-menu"
      />

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <Avatar icon={<UserOutlined />} />
          <span>
            <strong>{t('nav.admin')}</strong>
            <small>{t('nav.sessionActive')}</small>
          </span>
        </div>
        <Button icon={<LogoutOutlined />} onClick={logout} block>
          {t('nav.signOut')}
        </Button>
      </div>
    </div>
  )

  return (
    <Layout className="app-layout">
      {screens.lg && (
        <Sider width={252} theme="light" className="app-sider">
          {sidebar}
        </Sider>
      )}

      <Drawer
        open={!screens.lg && mobileMenuOpen}
        placement={i18n.resolvedLanguage === 'ar' ? 'right' : 'left'}
        onClose={() => setMobileMenuOpen(false)}
        size={280}
        styles={{ body: { padding: 0 } }}
      >
        {sidebar}
      </Drawer>

      <Layout>
        <Header className="app-header">
          <Space>
            {!screens.lg && (
              <Button aria-label={t('nav.openMenu')} icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)} />
            )}
            <div>
              <Text className="header-kicker">{t('nav.workspace')}</Text>
              <div className="header-title">{t('nav.tracks')}</div>
            </div>
          </Space>
          <PreferenceControls compact={!screens.sm} />
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
