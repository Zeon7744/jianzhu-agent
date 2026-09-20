import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Statistic, Progress, Table, Tag, Button, Space, Badge, Typography, Spin, Alert, Timeline, Avatar, Divider, List, Empty
} from 'antd'
import {
  ProjectOutlined, TeamOutlined, DollarOutlined, ToolOutlined,
  RiseOutlined, FallOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, RobotOutlined,
  FireOutlined, ThunderboltOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

const { Title, Text } = Typography

// 模拟数据
const mockData = {
  kpis: [
    { title: '在研项目', value: 28, change: 12, icon: <ProjectOutlined />, color: '#1890ff', bg: '#e6f7ff' },
    { title: '本月检测批次', value: 156, change: 8, icon: <CheckCircleOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: '应收账款(万元)', value: 342, change: -5, icon: <DollarOutlined />, color: '#faad14', bg: '#fffbe6' },
    { title: '设备完好率', value: '96%', change: 2, icon: <ToolOutlined />, color: '#722ed1', bg: '#f9f0ff' },
  ],
  projects: [
    { key: '1', name: 'XX大厦主体结构检测', client: 'XX地产集团', status: '进行中', progress: 75, risk: '中', deadline: '2026-10-15' },
    { key: '2', name: 'YY桥梁荷载试验', client: '市交通局', status: '报告编制', progress: 90, risk: '低', deadline: '2026-09-30' },
    { key: '3', name: 'ZZ小区房屋安全鉴定', client: 'ZZ街道办', status: '现场检测', progress: 45, risk: '高', deadline: '2026-10-08' },
    { key: '4', name: 'AA学校抗震鉴定', client: '区教育局', status: '已完成', progress: 100, risk: '低', deadline: '2026-09-10' },
    { key: '5', name: 'BB厂房钢结构检测', client: 'BB制造业', status: '待开工', progress: 0, risk: '低', deadline: '2026-10-20' },
  ],
  tasks: [
    { key: '1', title: 'XX大厦检测报告审核', agent: '智检', priority: 'high', due: '今天', status: 'pending' },
    { key: '2', title: 'YY桥梁项目结算单确认', agent: '智财', priority: 'high', due: '今天', status: 'pending' },
    { key: '3', title: '新员工培训安排', agent: '智人', priority: 'medium', due: '明天', status: 'pending' },
    { key: '4', title: '设备检定计划更新', agent: '智设', priority: 'medium', due: '本周', status: 'pending' },
    { key: '5', title: 'Q3合规审查报告', agent: '智法', priority: 'low', due: '下周', status: 'pending' },
  ],
  agents: [
    { name: '智管', role: '总经理助理', avatar: '🧠', status: 'online', task: '经营分析' },
    { name: '智财', role: '财务主管', avatar: '💰', status: 'online', task: '月度结算' },
    { name: '智项', role: '项目经理', avatar: '📋', status: 'busy', task: '项目协调' },
    { name: '智检', role: '检测主管', avatar: '🔬', status: 'online', task: '报告审核' },
    { name: '智人', role: 'HR主管', avatar: '👥', status: 'offline', task: '-' },
    { name: '智客', role: '客户总监', avatar: '🤝', status: 'online', task: '客户回访' },
    { name: '智法', role: '合规顾问', avatar: '⚖️', status: 'online', task: '法规跟踪' },
    { name: '智设', role: '设备管理员', avatar: '🔧', status: 'busy', task: '设备巡检' },
  ],
  revenue: { months: ['1月','2月','3月','4月','5月','6月','7月'], income: [45, 52, 48, 61, 55, 68, 72], expense: [32, 35, 33, 40, 38, 42, 45] },
  alerts: [
    { type: 'warning', time: '10:30', content: 'YY桥梁项目即将到期，需加速推进' },
    { type: 'danger', time: '09:15', content: '3台检测设备检定即将到期' },
    { type: 'success', time: '昨天', content: 'AA学校项目报告已归档' },
    { type: 'info', time: '昨天', content: '新签订XX地产框架合同' },
  ],
  inspections: {
    types: ['主体结构', '地基基础', '钢结构', '建筑材料', '室内环境'],
    values: [35, 25, 20, 15, 5]
  },
  risks: [
    { name: '项目延期风险', level: 75, desc: '3个项目临近节点' },
    { name: '质量风险', level: 30, desc: '整体可控' },
    { name: '回款风险', level: 60, desc: '应收账款积压' },
    { name: '合规风险', level: 20, desc: '近期货规无更新' },
  ]
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Spin size="large" tip="加载经营数据..." />
      </div>
    )
  }

  return (
    <div className="page-container fade-in">
      {/* 页面标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>管理驾驶舱</Title>
          <Text type="secondary">中建检测咨询有限公司 · 实时经营概览</Text>
        </div>
        <Space>
          <Button icon={<ThunderboltOutlined />} onClick={refresh} loading={refreshing}>
            刷新数据
          </Button>
          <Button type="primary" icon={<RobotOutlined />}>
            AI分析报告
          </Button>
        </Space>
      </div>

      {/* KPI卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {mockData.kpis.map((kpi, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card hoverable style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{kpi.title}</Text>
                  <div style={{ fontSize: 32, fontWeight: 700, color: kpi.color, marginTop: 4 }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <span style={{ color: kpi.change >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      {kpi.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(kpi.change)}%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 4 }}>较上月</Text>
                  </div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: kpi.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: kpi.color, fontSize: 24
                }}>
                  {kpi.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 主内容区 */}
      <Row gutter={[16, 16]}>
        {/* 经营趋势图 */}
        <Col xs={24} lg={16}>
          <Card
            title={<><span>📈 经营趋势</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>近7个月收入vs支出</Text></>}
            extra={<Button size="small">查看详情</Button>}
            style={{ borderRadius: 12 }}
          >
            <ReactECharts
              option={{
                tooltip: { trigger: 'axis' },
                legend: { data: ['收入', '支出'], bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
                xAxis: { type: 'category', data: mockData.revenue.months },
                yAxis: { type: 'value', name: '万元' },
                series: [
                  { name: '收入', type: 'line', data: mockData.revenue.income, smooth: true,
                    areaStyle: { opacity: 0.1 }, lineStyle: { width: 3 }, itemStyle: { color: '#1890ff' } },
                  { name: '支出', type: 'line', data: mockData.revenue.expense, smooth: true,
                    areaStyle: { opacity: 0.1 }, lineStyle: { width: 3 }, itemStyle: { color: '#faad14' } }
                ]
              }}
              style={{ height: 260 }}
            />
          </Card>
        </Col>

        {/* 数字员工状态 */}
        <Col xs={24} lg={8}>
          <Card
            title={<><span>🤖 数字员工中心</span><Badge count={8} style={{ backgroundColor: '#722ed1', marginLeft: 8 }} /></>}
            extra={<Button size="small" href="#/agents">全部</Button>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            <List
              dataSource={mockData.agents}
              renderItem={agent => (
                <List.Item
                  style={{ padding: '10px 0', cursor: 'pointer', borderRadius: 8, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f6f8fa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: '#f0f5ff', fontSize: 20 }}>{agent.avatar}</Avatar>}
                    title={
                      <Space>
                        <span>{agent.name}</span>
                        <Badge status={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'warning' : 'default'} />
                      </Space>
                    }
                    description={
                      <Space size={4} style={{ fontSize: 12, color: '#595959' }}>
                        <span>{agent.role}</span>
                        <span>·</span>
                        <span style={{ color: '#1890ff' }}>{agent.task}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 进行中项目 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card
            title={<><span>📋 进行中项目</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>共{mockData.projects.length}个项目</Text></>}
            extra={<Button size="small" href="#/projects">查看全部</Button>}
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={mockData.projects}
              pagination={false}
              size="small"
              rowKey="key"
              columns={[
                { title: '项目名称', dataIndex: 'name', ellipsis: true },
                { title: '客户', dataIndex: 'client', width: 120 },
                { title: '状态', dataIndex: 'status', width: 100, render: v => {
                  const map = { '进行中': 'blue', '报告编制': 'purple', '现场检测': 'green', '已完成': 'default', '待开工': 'orange' }
                  return <Tag color={map[v] || 'default'}>{v}</Tag>
                }},
                { title: '进度', width: 120, render: (_, r) => <Progress percent={r.progress} size="small" status={r.progress === 100 ? 'success' : 'normal'} /> },
                { title: '风险', dataIndex: 'risk', width: 80, render: v => <Tag color={v === '高' ? 'red' : v === '中' ? 'orange' : 'green'}>{v}</Tag> },
                { title: '截止日期', dataIndex: 'deadline', width: 100 },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          {/* 待办任务 */}
          <Card
            title={<><span>⏰ 今日待办</span><Badge count={5} color="red" /></>}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            {mockData.tasks.map(task => (
              <div key={task.key} style={{
                display: 'flex', alignItems: 'center', padding: '10px 12px',
                background: '#fafafa', borderRadius: 8, marginBottom: 8, cursor: 'pointer'
              }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: task.priority === 'high' ? '#ff4d4f' : task.priority === 'medium' ? '#faad14' : '#52c41a', marginRight: 12 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                    <RobotOutlined style={{ marginRight: 4 }} />{task.agent} · {task.due}
                  </div>
                </div>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #d9d9d9', marginLeft: 8 }} />
              </div>
            ))}
            <Button type="dashed" block style={{ marginTop: 8, borderColor: '#d9d9d9' }}>
              + 添加任务
            </Button>
          </Card>

          {/* 预警信息 */}
          <Card
            title={<><span>⚠️ 预警信息</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>4条待处理</Text></>}
            style={{ borderRadius: 12 }}
          >
            <Timeline
              items={mockData.alerts.map(a => ({
                color: a.type === 'danger' ? 'red' : a.type === 'warning' ? 'orange' : a.type === 'success' ? 'green' : 'blue',
                children: (
                  <div>
                    <div style={{ fontSize: 13 }}>{a.content}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{a.time}</div>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>
      </Row>

      {/* 风险指标 & 检测分布 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><span>🎯 风险雷达</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>AI风险评估</Text></>} style={{ borderRadius: 12 }}>
            {mockData.risks.map((r, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: r.level > 60 ? '#ff4d4f' : r.level > 40 ? '#faad14' : '#52c41a' }}>
                    {r.level > 60 ? '高风险' : r.level > 40 ? '中风险' : '低风险'} · {r.desc}
                  </span>
                </div>
                <Progress
                  percent={r.level}
                  strokeColor={r.level > 60 ? '#ff4d4f' : r.level > 40 ? '#faad14' : '#52c41a'}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><span>🔬 检测业务分布</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>按检测类型统计</Text></>} style={{ borderRadius: 12 }}>
            <ReactECharts
              option={{
                tooltip: { trigger: 'item' },
                legend: { orient: 'vertical', right: 0, top: 'center' },
                series: [{
                  type: 'pie',
                  radius: ['40%', '70%'],
                  center: ['35%', '50%'],
                  avoidLabelOverlap: false,
                  itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                  label: { show: false },
                  data: mockData.inspections.types.map((t, i) => ({
                    value: mockData.inspections.values[i],
                    name: t,
                    itemStyle: { color: ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96'][i] }
                  }))
                }]
              }}
              style={{ height: 220 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
