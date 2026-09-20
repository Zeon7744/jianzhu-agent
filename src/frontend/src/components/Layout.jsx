import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Badge,
  Dropdown,
  Space,
  theme,
  Typography,
  BadgeDot
} from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  TeamOutlined,
  DollarOutlined,
  ToolOutlined,
  UserOutlined,
  SafetyOutlined,
  BookOutlined,
  RobotOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SearchOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '管理驾驶舱' },
  { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
  { key: '/inspections', icon: <FileTextOutlined />, label: '检测业务' },
  { key: '/hr', icon: <TeamOutlined />, label: '人力资源' },
  { key: '/finance', icon: <DollarOutlined />, label: '财务管理' },
  { key: '/equipment', icon: <ToolOutlined />, label: '设备管理' },
  { key: '/customers', icon: <UserOutlined />, label: '客户管理' },
  { key: '/compliance', icon: <SafetyOutlined />, label: '合规风控' },
  { key: '/knowledge', icon: <BookOutlined />, label: '知识管理' },
  { key: '/agents', icon: <RobotOutlined />, label: '数字员工' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' }
]

const layoutTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    colorBgBase: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8,
    fontFamily: "'Noto Sans SC', sans-serif"
  }
}

export default function AppLayout({ user }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
      { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        navigate('/')
      }
    }
  }

  return (
    <AntLayout theme={layoutTheme} style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={64}
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 8
        }}>
          <span style={{ fontSize: collapsed ? 20 : 24 }}>🏗️</span>
          {!collapsed && (
            <Typography.Text
              style={{ color: '#fff', marginLeft: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              建检智管
            </Typography.Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, background: '#001529' }}
        />
      </Sider>

      <AntLayout
        style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s' }}
      >
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99
          }}
        >
          <Space>
            {collapsed ? (
              <MenuUnfoldOutlined
                onClick={() => setCollapsed(false)}
                style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }}
              />
            ) : (
              <MenuFoldOutlined
                onClick={() => setCollapsed(true)}
                style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }}
              />
            )}
            <Breadcrumb items={getBreadcrumbs(location.pathname)} />
          </Space>

          <Space size={16}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <BadgeDot />
              <BellOutlined style={{ fontSize: 18, color: '#595959' }} />
              <Badge count={5} size="small" style={{ right: -4, top: -4 }} />
            </div>
            <Dropdown {...userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ background: '#1890ff' }}>
                  {user.name.charAt(0)}
                </Avatar>
                <Typography.Text style={{ color: '#595959' }}>
                  {user.name}
                </Typography.Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

function Breadcrumb({ items }) {
  return (
    <Space size={8} style={{ fontSize: 14, color: '#595959' }}>
      {items.map((item, index) => (
        <Space key={index} size={4}>
          {index > 0 && <span>/</span>}
          <span style={{ color: index === items.length - 1 ? '#000' : '#595959' }}>
            {item.icon}{item.label}
          </span>
        </Space>
      ))}
    </Space>
  )
}

function getBreadcrumbs(pathname) {
  const map = {
    '/dashboard': [{ label: '管理驾驶舱', icon: '📊' }],
    '/projects': [{ label: '项目管理', icon: '📁' }],
    '/inspections': [{ label: '检测业务', icon: '🔬' }],
    '/hr': [{ label: '人力资源', icon: '👥' }],
    '/finance': [{ label: '财务管理', icon: '💰' }],
    '/equipment': [{ label: '设备管理', icon: '🔧' }],
    '/customers': [{ label: '客户管理', icon: '🤝' }],
    '/compliance': [{ label: '合规风控', icon: '🛡️' }],
    '/knowledge': [{ label: '知识管理', icon: '📚' }],
    '/agents': [{ label: '数字员工', icon: '🤖' }],
    '/settings': [{ label: '系统设置', icon: '⚙️' }]
  }
  return map[pathname] || []
}
