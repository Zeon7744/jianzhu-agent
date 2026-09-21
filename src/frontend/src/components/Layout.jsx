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
  Tag,
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
  LogoutOutlined,
  ShoppingCartOutlined,
  ContainerOutlined,
  ShoppingOutlined,
  PieChartOutlined, BankOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout

const ROLE_LABELS = {
  admin:   { label: '总经理', color: 'gold', bg: '#fff7e6' },
  manager: { label: '主管',   color: 'orange', bg: '#fffbe6' },
  staff:   { label: '员工',   color: 'blue',   bg: '#e6f7ff' },
  guest:   { label: '访客',   color: 'default', bg: '#f5f5f5' },
}

const PAGE_META = {
  dashboard:   { icon: <DashboardOutlined />,  label: '管理驾驶舱' },
  projects:    { icon: <ProjectOutlined />,    label: '项目管理' },
  inspections: { icon: <FileTextOutlined />,   label: '检测业务' },
  hr:          { icon: <TeamOutlined />,       label: '人力资源' },
  finance:     { icon: <DollarOutlined />,     label: '财务管理' },
  equipment:   { icon: <ToolOutlined />,       label: '设备管理' },
  customers:   { icon: <UserOutlined />,       label: '客户管理' },
  compliance:  { icon: <SafetyOutlined />,     label: '合规风控' },
  knowledge:   { icon: <BookOutlined />,       label: '知识管理' },
  agents:      { icon: <RobotOutlined />,      label: '数字员工' },
  settings:    { icon: <SettingOutlined />,    label: '系统设置' },
  contracts:   { icon: <FileTextOutlined />,   label: '合同管理' },
  reports:     { icon: <FileTextOutlined />,   label: '检测报告' },
  trade:       { icon: <ShoppingCartOutlined />, label: '贸易管理' },
  materials:   { icon: <ContainerOutlined />,  label: '材料管理' },
  procurement: { icon: <ShoppingOutlined />,   label: '采购管理' },
  budget:      { icon: <PieChartOutlined />,   label: '预算管理' },
}

export default function AppLayout({ user, token, onLogout, allowedPages }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.guest

  const menuItems = (allowedPages || []).map(page => ({
    key: '/' + page,
    icon: PAGE_META[page]?.icon,
    label: PAGE_META[page]?.label || page,
  }))

  const userMenu = {
    items: [
      { key: 'role', label: <Space><Tag color={roleInfo.color}>{roleInfo.label}</Tag>{user?.name}</Space>, disabled: true },
      { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') onLogout()
    },
  }

  return (
    <AntLayout theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: '#1890ff', borderRadius: 8, fontFamily: "'Noto Sans SC', sans-serif" } }} style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={64}
        style={{ background: '#001529', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? 0 : '0 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
          <span style={{ fontSize: collapsed ? 20 : 24 }}>🏗️</span>
          {!collapsed && <Typography.Text style={{ color: '#fff', marginLeft: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>建检智管</Typography.Text>}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} style={{ borderRight: 0, background: '#001529' }} />
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s' }}>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 99 }}>
          <Space>
            {collapsed ? (
              <MenuUnfoldOutlined onClick={() => setCollapsed(false)} style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }} />
            ) : (
              <MenuFoldOutlined onClick={() => setCollapsed(false)} style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }} />
            )}
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {PAGE_META[location.pathname.replace('/', '')]?.label || '系统'}
            </Typography.Text>
          </Space>

          <Space size={16}>
            <Badge count={3} size="small" style={{ cursor: 'pointer' }} />
            <Dropdown {...userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ background: '#1890ff' }}>{user?.name?.charAt(0) || 'U'}</Avatar>
                <Typography.Text style={{ color: '#595959' }}>{user?.name || '用户'}</Typography.Text>
                <Tag color={roleInfo.color} style={{ marginLeft: 4, margin: 0 }}>{roleInfo.label}</Tag>
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