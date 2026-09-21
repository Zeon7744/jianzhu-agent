import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('jianjian_token')
  const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options, body: options.body ? JSON.stringify(options.body) : undefined })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ========== 认证状态 ==========
      user: null,
      token: localStorage.getItem('jianjian_token') || null,
      permissions: JSON.parse(localStorage.getItem('jianjian_perms') || '{}'),

      login: (data) => {
        set({ user: data.user, token: data.token, permissions: data.permissions || {} })
        localStorage.setItem('jianjian_user', JSON.stringify(data.user))
        localStorage.setItem('jianjian_token', data.token)
        localStorage.setItem('jianjian_perms', JSON.stringify(data.permissions || {}))
      },

      logout: () => {
        const token = get().token
        set({ user: null, token: null, permissions: {} })
        localStorage.removeItem('jianjian_user')
        localStorage.removeItem('jianjian_token')
        localStorage.removeItem('jianjian_perms')
        if (token) {
          fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => {})
        }
      },

      hasPermission: (module, action = 'view') => {
        const perms = get().permissions
        return perms[module]?.[`can_${action}`] === 1
      },

      canAccessPage: (page) => {
        const perms = get().permissions
        return perms[page]?.can_view === 1
      },

      // ========== 项目状态 ==========
      projects: [],
      projectsLoading: false,
      fetchProjects: async (status) => {
        set({ projectsLoading: true })
        try {
          const data = await request(`/api/projects${status ? `?status=${status}` : ''}`)
          set({ projects: data, projectsLoading: false })
        } catch (e) { console.error('Fetch projects failed:', e); set({ projectsLoading: false }) }
      },
      createProject: async (data) => {
        const result = await request('/api/projects', { method: 'POST', body: data })
        get().fetchProjects()
        return result
      },
      updateProject: async (id, data) => {
        await request(`/api/projects/${id}`, { method: 'PUT', body: data })
        get().fetchProjects()
      },
      deleteProject: async (id) => {
        await request(`/api/projects/${id}`, { method: 'DELETE' })
        get().fetchProjects()
      },

      // ========== 检测状态 ==========
      inspections: [],
      fetchInspections: async (status) => {
        try {
          const data = await request(`/api/inspections${status ? `?status=${status}` : ''}`)
          set({ inspections: data })
        } catch (e) { console.error('Fetch inspections failed:', e) }
      },
      createInspection: async (data) => {
        const result = await request('/api/inspections', { method: 'POST', body: data })
        get().fetchInspections()
        return result
      },
      updateInspection: async (id, data) => {
        await request(`/api/inspections/${id}`, { method: 'PUT', body: data })
        get().fetchInspections()
      },

      // ========== 员工状态 ==========
      staff: [],
      fetchStaff: async (dept) => {
        try {
          const data = await request(`/api/staff${dept ? `?dept=${dept}` : ''}`)
          set({ staff: data })
        } catch (e) { console.error('Fetch staff failed:', e) }
      },
      createStaff: async (data) => {
        const result = await request('/api/staff', { method: 'POST', body: data })
        get().fetchStaff()
        return result
      },

      // ========== 财务状态 ==========
      transactions: [],
      financeStats: null,
      fetchTransactions: async (type) => {
        try {
          const data = await request(`/api/transactions${type ? `?type=${type}` : ''}`)
          set({ transactions: data })
        } catch (e) { console.error('Fetch transactions failed:', e) }
      },
      createTransaction: async (data) => {
        const result = await request('/api/transactions', { method: 'POST', body: data })
        get().fetchTransactions()
        return result
      },
      fetchFinanceStats: async () => {
        try {
          const data = await request('/api/finance/stats')
          set({ financeStats: data })
        } catch (e) { console.error('Fetch finance stats failed:', e) }
      },

      // ========== 设备状态 ==========
      equipment: [],
      fetchEquipment: async (status) => {
        try {
          const data = await request(`/api/equipment${status ? `?status=${status}` : ''}`)
          set({ equipment: data })
        } catch (e) { console.error('Fetch equipment failed:', e) }
      },
      createEquipment: async (data) => {
        const result = await request('/api/equipment', { method: 'POST', body: data })
        get().fetchEquipment()
        return result
      },

      // ========== 客户状态 ==========
      customers: [],
      fetchCustomers: async () => {
        try {
          const data = await request('/api/customers')
          set({ customers: data })
        } catch (e) { console.error('Fetch customers failed:', e) }
      },
      createCustomer: async (data) => {
        const result = await request('/api/customers', { method: 'POST', body: data })
        get().fetchCustomers()
        return result
      },

      // ========== 知识状态 ==========
      knowledge: [],
      fetchKnowledge: async (category) => {
        try {
          const data = await request(`/api/knowledge${category ? `?category=${category}` : ''}`)
          set({ knowledge: data })
        } catch (e) { console.error('Fetch knowledge failed:', e) }
      },
      createKnowledge: async (data) => {
        await request('/api/knowledge', { method: 'POST', body: data })
        get().fetchKnowledge()
      },

      // ========== Agent状态 ==========
      agents: [],
      agentHistory: [],
      fetchAgents: async () => {
        try {
          const data = await request('/api/agents/list')
          set({ agents: data.agents || [] })
        } catch (e) { console.error('Fetch agents failed:', e) }
      },
      agentChat: async (agent, message) => {
        try {
          const data = await request('/api/agents/chat', { method: 'POST', body: { agent, message } })
          return data
        } catch (e) { console.error('Agent chat failed:', e); return null }
      },
      agentCollaborativeAnalysis: async (query, primary, include) => {
        try {
          const data = await request('/api/agents/collaborative-analysis', { method: 'POST', body: { query, primary_agent: primary, include_agents: include || [] } })
          return data
        } catch (e) { console.error('Collaborative analysis failed:', e); return null }
      },

      // ========== Dashboard统计 ==========
      dashboardStats: null,
      fetchDashboardStats: async () => {
        try {
          const data = await request('/api/stats/dashboard')
          set({ dashboardStats: data })
        } catch (e) { console.error('Fetch dashboard stats failed:', e) }
      },

      // ========== 鍚堝悓鐘舵€?
      contracts: [],
      fetchContracts: async () => {
        try {
          const data = await request('/api/contracts')
          set({ contracts: data })
        } catch (e) { console.error('Fetch contracts failed:', e) }
      },
      createContract: async (data) => {
        const result = await request('/api/contracts', { method: 'POST', body: data })
        get().fetchContracts()
        return result
      },

      // ========== 妫€娴嬫姤鍛婄姸鎬?
      reports: [],
      fetchReports: async () => {
        try {
          const data = await request('/api/reports')
          set({ reports: data })
        } catch (e) { console.error('Fetch reports failed:', e) }
      },

      // ========== 璐告槗/渚涘簲鍟嗙姸鎬?
      suppliers: [],
      procurement: [],
      materials: [],
      businessStats: null,
      fetchSuppliers: async () => {
        try {
          const data = await request('/api/suppliers')
          set({ suppliers: data })
        } catch (e) { console.error('Fetch suppliers failed:', e) }
      },
      fetchProcurement: async () => {
        try {
          const data = await request('/api/procurement')
          set({ procurement: data })
        } catch (e) { console.error('Fetch procurement failed:', e) }
      },
      fetchMaterials: async () => {
        try {
          const data = await request('/api/materials')
          set({ materials: data })
        } catch (e) { console.error('Fetch materials failed:', e) }
      },
      fetchBusinessStats: async () => {
        try {
          const data = await request('/api/stats/business')
          set({ businessStats: data })
        } catch (e) { console.error('Fetch business stats failed:', e) }
      },

      // ========== AI助手日志 ==========
      agentLogs: [],
      fetchAgentLogs: async (agent, limit = 50) => {
        try {
          const data = await request(`/api/agent-logs?agent=${agent}&limit=${limit}`)
          set({ agentLogs: data })
        } catch (e) { console.error('Fetch agent logs failed:', e) }
      },
      logAgentAction: async (agent, action, content, result) => {
        await request('/api/agent-logs', { method: 'POST', body: { agent, action, content, result } })
      },

      // ========== AI分析服务 ==========
      aiAnalysis: null,
      aiAnalysisLoading: false,

      generateReport: async (type, context) => {
        set({ aiAnalysisLoading: true })
        const mockResults = {
          'project': {
            summary: '当前有4个在建项目，其中1个高风险项目需要重点关注。ZZ小区项目进度滞后，建议增加检测人员。整体回款率82%，应收账款78万元需加强催收。',
            risks: ['项目延期风险：1个项目临近节点', '回款风险：应收账款积压', '设备风险：2台设备检定即将到期'],
            suggestions: ['建议增加现场检测人员2名', '本周安排应收账款催收会议', '立即安排SB003设备送检']
          },
          'finance': {
            summary: '本月收入298.7万元，支出47.3万元，净利润251.4万元，利润率84.7%。人力成本占比最高(42.2万)，建议关注预算执行。',
            risks: ['人力成本偏高', '设备折旧影响利润'],
            suggestions: ['优化外包人员配置', '考虑部分设备租赁替代采购']
          },
          'compliance': {
            summary: '合规得分96分，整体合规状况良好。最新《建设工程质量检测管理办法》已生效，建议组织全员学习。',
            risks: ['设备检定即将到期'],
            suggestions: ['组织新规培训', '安排设备送检']
          }
        }
        setTimeout(() => {
          set({ aiAnalysis: mockResults[type] || { summary: '分析完成', risks: [], suggestions: [] }, aiAnalysisLoading: false })
        }, 1500)
      },

      chatWithAgent: async (agent, message) => {
        const responses = {
          '智管': '根据今日数据，经营情况如下：\n\n📊 项目进度：4个在建项目，平均进度67%\n💰 应收账款：78万元，本周到期20万元\n⚠️ 风险预警：1个项目临近节点需关注\n\n建议本周重点跟进ZZ小区项目回款。',
          '智财': '本月财务状况：\n📈 收入：298.7万元（较上月+15%）\n📉 支出：47.3万元（较上月+8%）\n💵 利润：251.4万元（利润率84.7%）\n\n预算执行：人力成本51%，建议关注。',
          '智项': '项目状态更新：\n🔴 高风险：ZZ小区房屋安全鉴定（进度45%，截止10/08）\n🟡 中风险：XX大厦主体结构检测（进度75%，截止10/15）\n🟢 正常：YY桥梁荷载试验（进度90%，即将完成）\n\n建议优先处理ZZ小区项目。',
          '智检': '检测任务分析：\n📋 本月检测批次：156次，合格率98.5%\n⏱️ 待检测：3批次\n🔬 报告中：2批次\n\nXX大厦混凝土强度检测报告已通过初审。',
          '智人': '人力资源情况：\n👥 在职人数：8人，技术人员5人\n📜 证书到期：2人即将到期，已发送续期提醒\n📅 排班建议：本周6个项目并行，建议增派2人\n\n新员工培训安排在周三下午。',
          '智客': '客户关系分析：\n⭐ 优质客户：XX地产集团、市交通局\n💼 新增商机：AA建设集团新项目意向\n📞 待回访：5家客户超过30天未联系\n\n建议本周内完成重点客户回访。',
          '智法': '合规审查结果：\n✅ 资质证书：全部有效\n✅ 人员持证：100%覆盖\n⚠️ 设备检定：SB003即将到期(11天)\n\n新法规《建设工程质量检测管理办法》已生效，建议组织培训。',
          '智设': '设备管理报告：\n🔧 设备总数：8台，完好率87.5%\n⚠️ 需关注：SB003钢筋扫描仪检定即将到期\n🔍 预测维护：万能试验机建议下周润滑保养\n\n建议本周安排SB003送检。',
        }
        setTimeout(() => {
          set({ aiAnalysis: { summary: responses[agent] || '正在分析...', risks: [], suggestions: [] }, aiAnalysisLoading: false })
        }, 1000)
      },
    }),
    { name: 'jianjian-store' }
  )
)
