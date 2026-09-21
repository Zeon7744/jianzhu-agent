import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Inspections from './pages/Inspections'
import HR from './pages/HR'
import Finance from './pages/Finance'
import Equipment from './pages/Equipment'
import Customers from './pages/Customers'
import Compliance from './pages/Compliance'
import Knowledge from './pages/Knowledge'
import Agents from './pages/Agents'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Contracts from './pages/Contracts'
import Reports from './pages/Reports'
import Trade from './pages/Trade'
import Materials from './pages/Materials'
import Procurement from './pages/Procurement'
import Budget from './pages/Budget'
import Policies from './pages/Policies'
import Qualifications from './pages/Qualifications'
import Training from './pages/Training'
import Organization from './pages/Organization'
import './index.css'

const ROLE_PAGES = {
  admin:   ['dashboard','projects','inspections','hr','finance','equipment','customers','compliance','knowledge','agents','settings','contracts','reports','trade','materials','procurement','budget','policies','qualifications','training','organization'],
  manager: ['dashboard','projects','inspections','hr','finance','equipment','customers','compliance','knowledge','agents','contracts','reports','trade','materials','budget','policies','qualifications','training','organization'],
  staff:   ['dashboard','projects','inspections','equipment','customers','compliance','knowledge','agents','contracts','reports','materials','budget'],
  guest:   ['dashboard','projects','inspections','compliance','knowledge','agents','reports'],
}

function ProtectedRoute({ user, children, requiredRole }) {
  if (!user) return <Navigate to="/" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jianjian_user')) || null } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('jianjian_token') || null)

  const handleLogin = (data) => {
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('jianjian_user', JSON.stringify(data.user))
    localStorage.setItem('jianjian_token', data.token)
    localStorage.setItem('jianjian_perms', JSON.stringify(data.permissions || {}))
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jianjian_user')
    localStorage.removeItem('jianjian_token')
    localStorage.removeItem('jianjian_perms')
  }

  const allowedPages = user ? (ROLE_PAGES[user.role] || ROLE_PAGES.guest) : []
  const defaultPage = allowedPages[0] || 'dashboard'

  const routeMap = {
    dashboard: <Dashboard />,
    projects: <Projects />,
    inspections: <Inspections />,
    hr: <HR />,
    finance: <Finance />,
    equipment: <Equipment />,
    customers: <Customers />,
    compliance: <Compliance />,
    knowledge: <Knowledge />,
    agents: <Agents />,
    settings: <Settings />,
    contracts: <Contracts />,
    reports: <Reports />,
    trade: <Trade />,
    materials: <Materials />,
    procurement: <Procurement />,
    budget: <Budget />,
    policies: <Policies />,
    qualifications: <Qualifications />,
    training: <Training />,
    organization: <Organization />,
  }

  return (
    <ConfigProvider theme={{ algorithm: undefined, token: { colorPrimary: '#1890ff', borderRadius: 8 } }}>
      <Router>
        <Routes>
          <Route path="/" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={`/${defaultPage}`} replace />} />
          
          {user ? (
            <Route path="/" element={<Layout user={user} token={token} onLogout={handleLogout} allowedPages={allowedPages} />}>
              {allowedPages.map(page => (
                <Route key={page} path={page} element={<ProtectedRoute user={user}>{routeMap[page]}</ProtectedRoute>} />
              ))}
              <Route index element={<Navigate to={`/${defaultPage}`} replace />} />
              <Route path="*" element={<Navigate to={`/${defaultPage}`} replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App
