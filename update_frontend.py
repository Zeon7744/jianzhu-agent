# -*- coding: utf-8 -*-
"""Update App.jsx, Layout.jsx, and store/index.js for new enterprise pages."""

import os

BASE = r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\frontend\src'

# ===== Update App.jsx =====
app_path = os.path.join(BASE, 'App.jsx')
content = open(app_path, 'r', encoding='utf-8').read()

# Add imports
if 'import Policies' not in content:
    content = content.replace(
        "import Budget from './pages/Budget'",
        "import Budget from './pages/Budget'\nimport Policies from './pages/Policies'\nimport Qualifications from './pages/Qualifications'\nimport Training from './pages/Training'\nimport Organization from './pages/Organization'"
    )

# Rewrite ROLE_PAGES
content = content.replace(
    "  guest:   ['dashboard','projects','inspections','compliance','knowledge','agents','reports'],",
    "  guest:   ['dashboard','projects','inspections','compliance','knowledge','agents','reports'],\n  admin:   ['dashboard','projects','inspections','hr','finance','equipment','customers','compliance','knowledge','agents','settings','contracts','reports','trade','materials','procurement','budget','policies','qualifications','training','organization'],\n  manager: ['dashboard','projects','inspections','hr','finance','equipment','customers','compliance','knowledge','agents','contracts','reports','trade','materials','budget','policies','qualifications','training','organization'],\n  staff:   ['dashboard','projects','inspections','equipment','customers','compliance','knowledge','agents','contracts','reports','materials','budget'],"
)

# Add routes
if 'policies: <Policies />' not in content:
    content = content.replace(
        "    budget: <Budget />,",
        "    budget: <Budget />,\n    policies: <Policies />,\n    qualifications: <Qualifications />,\n    training: <Training />,\n    organization: <Organization />,"
    )

open(app_path, 'w', encoding='utf-8').write(content)
print('App.jsx updated')

# ===== Update Layout.jsx =====
layout_path = os.path.join(BASE, 'components/Layout.jsx')
content = open(layout_path, 'r', encoding='utf-8').read()

# Add icons to import
if 'ArticleOutlined' not in content:
    content = content.replace(
        'PieChartOutlined,',
        'PieChartOutlined, ArticleOutlined, CertifyOutlined, SettingOutlined,'
    )

# Add PAGE_META entries
if 'policies:' not in content or '制度管理' not in content:
    content = content.replace(
        "  budget:      { icon: <PieChartOutlined />, label: '预算管理' },",
        "  budget:      { icon: <PieChartOutlined />, label: '预算管理' },\n  policies:    { icon: <ArticleOutlined />,  label: '制度管理' },\n  qualifications: { icon: <CertifyOutlined />, label: '资质管理' },\n  training:    { icon: <SettingOutlined />,  label: '培训管理' },\n  organization: { icon: <DashboardOutlined />, label: '组织架构' },"
    )

open(layout_path, 'w', encoding='utf-8').write(content)
print('Layout.jsx updated')

# ===== Update store/index.js =====
store_path = os.path.join(BASE, 'store/index.js')
content = open(store_path, 'r', encoding='utf-8').read()

if 'fetchPolicies' not in content:
    additions = """
      // ========== 企业制度 ==========
      policies: [],
      fetchPolicies: async (category) => {
        try {
          const q = category ? `?category=${category}` : ''
          const data = await request(`/api/policies${q}`)
          set({ policies: data })
        } catch (e) { console.error('Fetch policies failed:', e) }
      },
      createPolicy: async (data) => {
        await request('/api/policies', { method: 'POST', body: data })
        get().fetchPolicies()
      },
      updatePolicy: async (id, data) => {
        await request(`/api/policies/${id}`, { method: 'PUT', body: data })
        get().fetchPolicies()
      },
      deletePolicy: async (id) => {
        await request(`/api/policies/${id}`, { method: 'DELETE' })
        get().fetchPolicies()
      },

      // ========== 资质管理 ==========
      qualifications: [],
      fetchQualifications: async () => {
        try {
          const data = await request('/api/qualifications')
          set({ qualifications: data })
        } catch (e) { console.error('Fetch qualifications failed:', e) }
      },
      createQualification: async (data) => {
        await request('/api/qualifications', { method: 'POST', body: data })
        get().fetchQualifications()
      },
      updateQualification: async (id, data) => {
        await request(`/api/qualifications/${id}`, { method: 'PUT', body: data })
        get().fetchQualifications()
      },
      deleteQualification: async (id) => {
        await request(`/api/qualifications/${id}`, { method: 'DELETE' })
        get().fetchQualifications()
      },
      qualificationStats: null,
      fetchQualificationStats: async () => {
        try {
          const data = await request('/api/stats/qualifications')
          set({ qualificationStats: data })
        } catch (e) {}
      },

      // ========== 培训管理 ==========
      trainingRecords: [],
      fetchTrainingRecords: async (staff_id) => {
        try {
          const q = staff_id ? `?staff_id=${staff_id}` : ''
          const data = await request(`/api/training-records${q}`)
          set({ trainingRecords: data })
        } catch (e) { console.error('Fetch training failed:', e) }
      },
      createTrainingRecord: async (data) => {
        await request('/api/training-records', { method: 'POST', body: data })
        get().fetchTrainingRecords()
      },
      trainingStats: null,
      fetchTrainingStats: async () => {
        try {
          const data = await request('/api/stats/training')
          set({ trainingStats: data })
        } catch (e) {}
      },

      // ========== 业务流程 ==========
      businessProcesses: [],
      fetchBusinessProcesses: async (category) => {
        try {
          const q = category ? `?category=${category}` : ''
          const data = await request(`/api/business-processes${q}`)
          set({ businessProcesses: data })
        } catch (e) { console.error('Fetch processes failed:', e) }
      },
      processSteps: {},
      fetchProcessSteps: async (process_id) => {
        try {
          const data = await request(`/api/process-steps/${process_id}`)
          set(prev => ({ ...prev, processSteps: { ...prev.processSteps, [process_id]: data } }))
        } catch (e) { console.error('Fetch steps failed:', e) }
      },

      // ========== 组织架构 ==========
      orgDepartments: [],
      fetchOrgDepartments: async () => {
        try {
          const data = await request('/api/org/departments')
          set({ orgDepartments: data })
        } catch (e) { console.error('Fetch org failed:', e) }
      },
"""
    content = content.replace(
        "    { name: 'jianjian-store' }",
        additions + "    { name: 'jianjian-store' }"
    )
    print('Store updated')

open(store_path, 'w', encoding='utf-8').write(content)
print('All files updated successfully')
