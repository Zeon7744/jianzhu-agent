import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Badge, Typography, Spin, Alert, Progress
} from 'antd'
import {
  ProjectOutlined, CheckCircleOutlined, DollarOutlined, ToolOutlined,
  ArrowUpOutlined, ArrowDownOutlined, RobotOutlined, ThunderboltOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography

export default function Dashboard() {
  const {
    projects, fetchProjects, dashboardStats, fetchDashboardStats,
    inspections, fetchInspections, staff, fetchStaff,
    equipment, fetchEquipment, customers, fetchCustomers,
    transactions, fetchTransactions, chatWithAgent
  } = useStore()

  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState([{ role: 'agent', content: '您好！我是建检智管AI助手。有什么可以帮您的？', time: '刚刚' }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    fetchProjects()
    fetchDashboardStats()
    fetchInspections()
    fetchStaff()
    fetchEquipment()
    fetchCustomers()
    fetchTransactions()
    return () => clearTimeout(timer)
  }, [])

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput
    setChatMsg(prev => [...prev, { role: 'user', content: userMsg, time: '刚刚' }])
    setChatInput('')
    setChatLoading(true)
    try {
      const response = await chatWithAgent('智管', userMsg)
      setChatMsg(prev => [...prev, { role: 'agent', content: response?.summary || '正在分析中...', time: '刚刚' }])
    } catch (e) {
      setChatMsg(prev => [...prev, { role: 'agent', content: '服务暂不可用，请稍后重试', time: '刚刚' }])
    } finally {
      setChatLoading(false)
    }
  }

  const stats = dashboardStats || {
    projects: { total: 0, active: 0, completed: 0, high_risk: 0 },
    finance: { ar_amount: 0, month_income: 0, month_expense: 0 },
    inspections: { total: 0, completed: 0, in_progress: 0 },
    equipment: { total: 0, normal: 0, warning: 0 },
    staff: { total: 0, tech: 0 }
  }

  const revenue = {
   months: ['1月','2月','3月','4月','5月','6月','7月'],
   income: [45,52,48,61,55,68,72],
   expense: [32,35,33,40,38,42,45]
 }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spin size="large" tip="加载经营数据..." /></div>
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>管理驾驶舱</Title>
          <Text type="secondary">中建检测咨询有限公司 | 实时经营概览</Text>
        </div>
        <Space>
          <Button icon={<ThunderboltOutlined />}>刷新数据</Button>
          <Button type="primary" icon={<RobotOutlined />} onClick={() => setChatOpen(!chatOpen)}>
            {chatOpen ? '收起助手' : 'AI智能助手'}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: '在建项目', value: stats.projects.total, change: 12, icon: <ProjectOutlined />, color: '#1890ff', bg: '#e6f7ff' },
          { title: '本月检测批次', value: stats.inspections.total, change: 8, icon: <CheckCircleOutlined />, color: '#52c41a', bg: '#f6ffed' },
          { title: '本月收入(万)', value: stats.finance.month_income || stats.finance.total_income, change: 12, icon: <DollarOutlined />, color: '#faad14', bg: '#fffbe6' },
          { title: '设备完好率', value: stats.equipment.total > 0 ? Math.round(stats.equipment.normal / stats.equipment.total * 100) + '%' : '87%', change: 2, icon: <ToolOutlined />, color: '#722ed1', bg: '#f9f0ff' },
        ].map((kpi, i) => (
          <Col xs={12} sm={12} xl={6} key={i}>
            <Card hoverable style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{kpi.title}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, marginTop: 4 }}>{kpi.value}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <span style={{ color: kpi.change >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      {kpi.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(kpi.change)}%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 4 }}>较上月</Text>
                  </div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, fontSize: 24 }}>{kpi.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={<><span>📈 经营趋势</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>近7个月收入vs支出</Text></>} extra={<Button size="small">查看详情</Button>} style={{ borderRadius: 12 }}>
            <ReactECharts option={{
              tooltip: { trigger: 'axis' },
              legend: { data: ['收入', '支出'], bottom: 0 },
              grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
              xAxis: { type: 'category', data: revenue.months },
              yAxis: { type: 'value', name: '万元' },
              series: [
                { name: '收入', type: 'line', data: revenue.income, smooth: true, areaStyle: { opacity: 0.1 }, lineStyle: { width: 3 }, itemStyle: { color: '#1890ff' } },
                { name: '支出', type: 'line', data: revenue.expense, smooth: true, areaStyle: { opacity: 0.1 }, lineStyle: { width: 3 }, itemStyle: { color: '#faad14' } }
              ]
            }} style={{ height: 260 }} />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title={<><span>🤖 数字员工中心</span><Badge count={8} style={{ backgroundColor: '#722ed1', marginLeft: 8 }} /></>} extra={<Button size="small" href="#/agents">全部</Button>} style={{ borderRadius: 12, height: '100%' }}>
            {[
              { name: '智管', role: '总经理助理', status: 'online', task: '经营分析' },
              { name: '智财', role: '财务主管', status: 'online', task: '月度结算' },
              { name: '智项', role: '项目经理', status: 'busy', task: '项目协调' },
              { name: '智检', role: '检测主管', status: 'online', task: '报告审核' },
              { name: '智人', role: 'HR主管', status: 'offline', task: '-' },
              { name: '智客', role: '客户总监', status: 'online', task: '客户回访' },
              { name: '智法', role: '合规顾问', status: 'online', task: '法规跟踪' },
              { name: '智设', role: '设备管理员', status: 'busy', task: '设备巡检' },
            ].map(a => (
              <div key={a.name} style={{ padding: '10px 0', cursor: 'pointer', borderRadius: 8, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f6f8fa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 24, marginRight: 12 }}>{a.status === 'online' ? '🤖' : a.status === 'busy' ? '⚡' : '💤'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 500 }}>{a.name}</span>
                    <Badge status={a.status === 'online' ? 'success' : a.status === 'busy' ? 'processing' : 'default'} />
                  </div>
                  <div style={{ fontSize: 12, color: '#595959' }}>{a.role} · <span style={{ color: '#1890ff' }}>{a.task}</span></div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={14}>
          <Card title={<><span>📋 进行中项目</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>共{projects.length}个项目</Text></>} extra={<Button size="small" href="#/projects">查看全部</Button>} style={{ borderRadius: 12 }}>
            <Table dataSource={projects} pagination={false} size="small" rowKey="id" columns={[
              { title: '项目编号', dataIndex: 'id', width: 120 },
              { title: '项目名称', dataIndex: 'name', ellipsis: true },
              { title: '客户', dataIndex: 'client', width: 120 },
              { title: '状态', dataIndex: 'status', width: 90, render: v => { const m = { pending: ['待开工','orange'], active: ['进行中','blue'], report: ['报告编制','purple'], completed: ['已完成','green'] }; const [label, color] = m[v] || [v,'default']; return <Tag color={color}>{label}</Tag>; }},
              { title: '进度', width: 120, render: (_, r) => <Progress percent={r.progress} size="small" status={r.progress === 100 ? 'success' : 'normal'} /> },
              { title: '风险', dataIndex: 'risk', width: 80, render: v => <ExclamationCircleOutlined style={{ color: v === 'high' ? '#ff4d4f' : v === 'medium' ? '#faad14' : '#52c41a', fontSize: 16 }} /> },
              { title: '截止日期', dataIndex: 'end_date', width: 100 },
            ]} />
          </Card>
        </Col>

        <Col xs={24} xl={5}>
          <Card title={<><span>⏰ 今日待办</span><Badge count={3} color="red" /></>} style={{ borderRadius: 12, marginBottom: 16 }}>
            {[
              { title: 'YY桥梁荷载试验报告审核', agent: '智检', due: '今日', priority: 'high' },
              { title: 'ZZ小区安全鉴定进度跟进', agent: '智项', due: '本周', priority: 'medium' },
              { title: 'SB003设备送检定', agent: '智设', due: '本周', priority: 'high' },
            ].map(task => (
              <div key={task.title} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: task.priority === 'high' ? '#ff4d4f' : task.priority === 'medium' ? '#faad14' : '#52c41a', marginRight: 12 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{task.agent} · {task.due}</div>
                </div>
              </div>
            ))}
            <Button type="dashed" block style={{ marginTop: 8, borderColor: '#d9d9d9' }}>+ 添加任务</Button>
          </Card>

          <Card title={<><span>⚠️ 预警信息</span><Badge count={stats.projects.high_risk + stats.equipment.warning} color="red" style={{ marginLeft: 8 }} /></>} style={{ borderRadius: 12 }}>
            {stats.finance.ar_amount > 0 && <Alert type="warning" showIcon style={{ marginBottom: 8 }} message={`应收账款 ${stats.finance.ar_amount}万元待回收`} />}
            {stats.equipment.warning > 0 && <Alert type="error" showIcon style={{ marginBottom: 8 }} message="设备检定即将到期，请及时送检" />}
            {stats.projects.active > 0 && <Alert type="info" showIcon style={{ marginBottom: 8 }} message={`${stats.projects.active}个项目进行中`} />}
            <Alert type="success" showIcon message="AA学校项目已归档" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><span>🔄 风险雷达</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>AI风险评估</Text></>} style={{ borderRadius: 12 }}>
            {[
              { name: '项目延期风险', level: 75, desc: '3个项目临近节点' },
              { name: '质量风险', level: 30, desc: '整体可控' },
              { name: '回款风险', level: 60, desc: '应收账款积压' },
              { name: '合规风险', level: 20, desc: '近期法规无更新' },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: r.level > 60 ? '#ff4d4f' : r.level > 40 ? '#faad14' : '#52c41a' }}>{r.level > 60 ? '高风险' : r.level > 40 ? '中风险' : '低风险'}</span>
                </div>
                <Progress percent={r.level} strokeColor={r.level > 60 ? '#ff4d4f' : r.level > 40 ? '#faad14' : '#52c41a'} showInfo={false} size="small" />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><span>🔬 检测业务分布</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>按类型统计</Text></>} style={{ borderRadius: 12 }}>
            <ReactECharts option={{
              tooltip: { trigger: 'item' },
              legend: { orient: 'vertical', right: 0, top: 'center' },
              series: [{
                type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
                data: [
                  { value: 35, name: '主体结构', itemStyle: { color: '#1890ff' } },
                  { value: 25, name: '地基基础', itemStyle: { color: '#52c41a' } },
                  { value: 20, name: '钢结构', itemStyle: { color: '#faad14' } },
                  { value: 15, name: '建筑材料', itemStyle: { color: '#722ed1' } },
                  { value: 5, name: '室内环境', itemStyle: { color: '#eb2f96' } },
                ]
              }]
            }} style={{ height: 220 }} />
          </Card>
        </Col>
      </Row>

      {chatOpen && (
        <div style={{ position: 'fixed', right: 0, top: 64, bottom: 0, width: 380, background: '#fff', boxShadow: '-2px 0 12px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space><RobotOutlined style={{ color: '#722ed1', fontSize: 20 }} /><Typography.Text strong>AI 智能助手</Typography.Text></Space>
            <Button type="text" icon={<ThunderboltOutlined />} onClick={() => setChatOpen(false)} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {chatMsg.map((msg, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.role === 'user' ? '#1890ff' : '#f0f0f0', color: msg.role === 'user' ? '#fff' : '#333', fontSize: 13, lineHeight: 1.6 }}>{msg.content}</div>
              </div>
            ))}
            {chatLoading && <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12, padding: 8 }}>AI思考中...</div>}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
            <Space style={{ width: '100%', display: 'flex' }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} placeholder="输入消息..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, outline: 'none' }} />
              <Button type="primary" onClick={handleChatSend} loading={chatLoading}>发送</Button>
            </Space>
          </div>
        </div>
      )}
    </div>
  )
}
