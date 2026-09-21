import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Badge, Typography, Spin, Alert, Progress } from 'antd'
import { ProjectOutlined, CheckCircleOutlined, DollarOutlined, ToolOutlined, ArrowUpOutlined, ArrowDownOutlined, RobotOutlined, ThunderboltOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'
const { Title, Text } = Typography

const MONTH_LABELS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

export default function Dashboard() {
  const { projects, fetchProjects, dashboardStats, fetchDashboardStats, businessStats, fetchBusinessStats, inspections, fetchInspections, equipment, fetchEquipment, transactions, fetchTransactions, agentChat } = useStore()
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState([{ role: 'agent', content: 'AI助手，欢迎咨询！请输入您关心的问题，如"今日经营概况"或"项目风险预警"。', time: '刚刚' }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [financeStats, setFinanceStats] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    fetchProjects()
    fetchDashboardStats()
    fetchBusinessStats()
    fetchInspections()
    fetchEquipment()
    fetchTransactions()
    fetch('http://localhost:8000/api/finance/stats')
      .then(r => r.json())
      .then(d => setFinanceStats(d))
      .catch(() => {})
    return () => clearTimeout(t)
  }, [])

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return
    setChatMsg(prev => [...prev, { role: 'user', content: chatInput, time: '刚刚' }])
    const msg = chatInput; setChatInput(''); setChatLoading(true)
    try {
      const r = await agentChat('智管', msg)
      setChatMsg(prev => [...prev, { role: 'agent', content: r?.summary || '分析中...', time: '刚刚' }])
    } catch(e) {
      setChatMsg(prev => [...prev, { role: 'agent', content: '服务暂不可用', time: '刚刚' }])
    } finally { setChatLoading(false) }
  }

  const stats = dashboardStats || { projects: { total: 0, active: 0, completed: 0, high_risk: 0 }, finance: { total_income: 0, total_expense: 0, profit: 0, ar_amount: 0, month_income: 0, month_expense: 0 }, inspections: { total: 0, completed: 0, in_progress: 0 }, equipment: { total: 0, normal: 0, warning: 0 }, staff: { total: 0, tech: 0 } }
  const fstats = financeStats || {}

  // Monthly trend chart
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], bottom: 0 },
    grid: { top: 10, right: 20, bottom: 30, left: 50 },
    xAxis: { type: 'category', data: MONTH_LABELS.slice(0, 9), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 11, formatter: v => v + '万' } },
    series: [
      { name: '收入', type: 'line', data: fstats.monthly_trend?.income || [45,52,48,61,55,68,72,65,78], smooth: true, areaStyle: { opacity: 0.1 }, itemStyle: { color: '#52c41a' } },
      { name: '支出', type: 'line', data: fstats.monthly_trend?.expense || [32,35,33,40,38,42,45,40,48], smooth: true, areaStyle: { opacity: 0.1 }, itemStyle: { color: '#ff4d4f' } }
    ]
  }

  // Project status pie
  const projectOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, fontSize: 11 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: stats.projects.active, name: '进行中', itemStyle: { color: '#1890ff' } },
        { value: stats.projects.completed, name: '已完成', itemStyle: { color: '#52c41a' } },
        { value: stats.projects.total - stats.projects.active - stats.projects.completed, name: '待开工', itemStyle: { color: '#d9d9d9' } }
      ]
    }]
  }

  // Risk alert cards
  const riskCards = []
  if (stats.projects.high_risk > 0) riskCards.push({ title: '高风险项目', value: stats.projects.high_risk, color: '#ff4d4f', icon: <ExclamationCircleOutlined /> })
  const equipWarn = (equipment || []).filter(e => e.status === 'warning').length
  if (equipWarn > 0) riskCards.push({ title: '设备预警', value: equipWarn, color: '#faad14', icon: <ToolOutlined /> })
  const arAmt = fstats.ar_amount || stats.finance.ar_amount
  if (arAmt > 0) riskCards.push({ title: '应收账款(万)', value: arAmt.toFixed(1), color: '#fa8c16', icon: <DollarOutlined /> })

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><Spin size='large' tip='加载中...' /></div>

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>管理驾驶舱</Title>
          <Text type="secondary">实时经营概览 · 数据驱动决策</Text>
        </div>
        <Button type="primary" icon={<RobotOutlined />} onClick={() => setChatOpen(true)}>AI助手</Button>
      </div>

      {/* Key metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '项目总数', sub: `${stats.projects.active}个进行中`, value: stats.projects.total, color: '#1890ff', icon: <ProjectOutlined /> },
          { label: '本月收入', sub: `支出 ${(fstats.month_expense||0).toFixed(1)}万`, value: `${(fstats.month_income||stats.finance.month_income||0).toFixed(1)}万`, color: '#52c41a', icon: <ArrowUpOutlined /> },
          { label: '检测任务', sub: `${stats.inspections.in_progress}个进行中`, value: stats.inspections.total, color: '#722ed1', icon: <CheckCircleOutlined /> },
          { label: '设备状态', sub: `${stats.equipment.normal}/${stats.equipment.total}正常`, value: stats.equipment.warning || equipWarn, color: equipWarn > 0 ? '#faad14' : '#52c41a', icon: <ToolOutlined /> },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{s.sub}</Text>
                </div>
                <div style={{ fontSize: 24, color: s.color, opacity: 0.6 }}>{s.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Charts */}
        <Col xs={24} lg={16}>
          <Card title={<><DollarOutlined /> 收支趋势（近9月）</>} style={{ borderRadius: 12 }} bodyStyle={{ padding: '8px 0' }}>
            <ReactECharts option={trendOption} style={{ height: 220 }} />
          </Card>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card title="项目分布" style={{ borderRadius: 12 }}>
                <ReactECharts option={projectOption} style={{ height: 180 }} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="财务摘要" style={{ borderRadius: 12 }}>
                {[
                  { label: '累计收入', value: `${(fstats.total_income||stats.finance.total_income||0).toFixed(1)}万`, color: '#52c41a' },
                  { label: '累计支出', value: `${(fstats.total_expense||stats.finance.total_expense||0).toFixed(1)}万`, color: '#ff4d4f' },
                  { label: '净利润', value: `${(fstats.profit||stats.finance.profit||0).toFixed(1)}万`, color: '#1890ff' },
                  { label: '利润率', value: `${fstats.profit_rate||stats.finance.profit_rate||0}%`, color: '#722ed1' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
                    <Text type="secondary">{r.label}</Text>
                    <Text strong style={{ color: r.color }}>{r.value}</Text>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Right side */}
        <Col xs={24} lg={8}>
          {/* Risk alerts */}
          {riskCards.length > 0 && (
            <Card title={<><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> 风险预警</>} style={{ borderRadius: 12, marginBottom: 16, background: '#fff2f0', borderColor: '#ffccc7' }}>
              {riskCards.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
                  <span style={{ color: r.color, fontSize: 18 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12 }}>{r.title}</Text>
                    <div style={{ fontSize: 20, fontWeight: 700, color: r.color }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Recent projects */}
          <Card title={<><ProjectOutlined /> 重点项目</>} style={{ borderRadius: 12, marginBottom: 16 }}>
            {(projects || []).filter(p => p.status !== 'completed').slice(0, 4).map(p => (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</Text>
                  <Tag color={p.risk === 'high' ? 'red' : p.risk === 'medium' ? 'orange' : 'green'} style={{ fontSize: 10 }}>{p.risk === 'high' ? '高' : p.risk === 'medium' ? '中' : '低'}</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Progress percent={p.progress} size="small" showInfo={false} strokeColor={p.progress >= 80 ? '#52c41a' : p.progress >= 50 ? '#1890ff' : '#faad14'} />
                  <Text style={{ fontSize: 11 }}>{p.progress}%</Text>
                </div>
              </div>
            ))}
          </Card>

          {/* Upcoming deadlines */}
          <Card title={<><ClockCircleOutlined /> 临近截止</>} style={{ borderRadius: 12 }}>
            {(projects || []).filter(p => p.status === 'active' || p.status === 'report').map(p => {
              const days = p.end_date ? Math.ceil((new Date(p.end_date) - new Date()) / 86400000) : 999
              return days <= 30 ? (
                <div key={p.id} style={{ padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <Text style={{ fontSize: 12 }}>{p.name?.substring(0, 12)}</Text>
                  <Text style={{ float: 'right', fontSize: 11, color: days <= 7 ? '#ff4d4f' : days <= 14 ? '#faad14' : '#8c8c8c' }}>
                    {days <= 0 ? '已逾期' : `${days}天`}
                  </Text>
                </div>
              ) : null
            })}
            {[(projects || []).filter(p => p.status === 'active' || p.status === 'report').filter(p => {
              const days = p.end_date ? Math.ceil((new Date(p.end_date) - new Date()) / 86400000) : 999
              return days > 30
            }).length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>近期无临近截止项目</Text>]}
          </Card>
        </Col>
      </Row>

      {/* Quick actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {[
          { label: '新建项目', icon: <ProjectOutlined />, color: '#1890ff', page: 'projects' },
          { label: '检测任务', icon: <CheckCircleOutlined />, color: '#722ed1', page: 'inspections' },
          { label: '设备检定', icon: <ToolOutlined />, color: '#fa8c16', page: 'equipment' },
          { label: '数字员工', icon: <RobotOutlined />, color: '#52c41a', page: 'agents' },
        ].map((a, i) => (
          <Col xs={12} sm={6} key={i}>
            <Button type="default" icon={a.icon} style={{ width: '100%', height: 48, borderRadius: 10, borderColor: a.color, color: a.color, fontWeight: 600 }}>{a.label}</Button>
          </Col>
        ))}
      </Row>

      {/* AI Chat modal */}
      <Modal title={<Space><RobotOutlined />AI经营助手</Space>} open={chatOpen} onCancel={() => setChatOpen(false)} footer={null} width={520}>
        <div style={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 12 }}>
            {chatMsg.map((msg, i) => (
              <div key={i} style={{ marginBottom: 10, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
                  background: msg.role === 'user' ? '#1890ff' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  fontSize: 13, whiteSpace: 'pre-wrap',
                  boxShadow: msg.role === 'agent' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  border: msg.role === 'agent' ? '1px solid #f0f0f0' : 'none'
                }}>{msg.content}</div>
              </div>
            ))}
            {chatLoading && <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12, padding: 8 }}><Spin size="small" />AI思考中...</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
              placeholder="输入问题，如：本月经营概况"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, outline: 'none' }}
              disabled={chatLoading}
            />
            <Button type="primary" icon={<RobotOutlined />} onClick={handleChatSend} loading={chatLoading}>发送</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
