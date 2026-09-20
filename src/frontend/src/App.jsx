import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  const [user] = useState({
    id: 1,
    name: '张管理',
    role: '总经理',
    avatar: '👤',
    company: '中建检测咨询有限公司'
  })

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="hr" element={<HR />} />
          <Route path="finance" element={<Finance />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="customers" element={<Customers />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="agents" element={<Agents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
