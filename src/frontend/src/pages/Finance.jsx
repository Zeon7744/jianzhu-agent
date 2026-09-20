import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, DatePicker, Statistic, Progress, Tooltip, Badge, Typography, message, Tabs
} from 'antd'
import {
  PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, RobotOutlined, ArrowUpOutlined, ArrowDownOutlined,
  WalletOutlined, AccountBookOutlined, BarChartOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'

const { Title, Text } = Typography
const { Search } = Input

const initialTransactions = [
  { id: 'SR2026001', type: 'income', name: 'XX大厦检测费', amount: 850000, date: '2026-09-15', account: '项目款', status: 'confirmed', source: '银行转账' },
  { id: 'SR2026002', type: 'expense', name: '检测设备维护费', amount: 32000, date: '2026-09-14', account: '设备维护', status: 'confirmed', source: '对公转账' },
  { id: 'SR2026003', type: 'income', name: 'YY桥梁检测预付款', amount: 600000, date: '2026-09-12', account: '项目款', status: 'pending', source: '支票' },
  { id: 'SR2026004', type: 'expense', name: '员工工资发放', amount: 285000, date: '2026-09-10', account: '人力成本', status: 'confirmed', source: '银行代发' },
  { id: 'SR2026005', type: 'expense', name: '办公场地租金', amount: 45000, date: '2026-09-01', account: '管理费用', status: 'confirmed', source: '对公转账' },
  { id: 'SR2026006', type: 'income', name: 'AA学校鉴定费', amount: 680000, date: '2026-09-01', account: '项目款', status: 'confirmed', source: '银行转账' },
  { id: 'SR2026007', type: 'expense', name: '耗材采购', amount: 18500, date: '2026-08-28', account: '检测耗材', status: 'confirmed', source: '支付宝' },
  { id: 'SR2026008', type: 'income', name: 'BB厂房检测预付款', amount: 275000, date: '2026-08-25', account: '项目款', status: 'pending', source: '银行转账' },
]

const monthlyData = {
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
  income: [45, 52, 48, 61, 55, 68, 72],
  expense: [32, 35, 33, 40, 38, 42, 45]
}

const categories = [
  { name: '项目收入', value: 420, color: '#52c41a' },
  { name: '咨询服务', value: 85, color: '#1890ff' },
  { name: '人力成本', value: 95, color: '#ff4d4f' },
  { name: '设备折旧', value: 38, color: '#faad14' },
  { name: '管理费用', value: 28, color: '#722ed1' },
  { name: '检测耗材', value: 22, color: '#eb2f96' }
]

export default function Finance() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [filterType, setFilterType] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const filtered = transactions.filter(t => filterType === 'all' || t.type === filterType)

  const stats = {
    income: 185.6,
    expense: 136.0,
    profit: 49.6,
    ar: 85.2,
    arRate: '78%'
  }

  const columns = [
    { title: '流水号', dataIndex: 'id', width: 120 },
    { title: '摘要', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '金额(元)', width: 110, render: (_, r) => <Text style={{ color: r.type === 'income' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>{r.type === 'income' ? '+' : '-'}{(r.amount / 10000).toFixed(1)}万</Text> },
    { title: '日期', dataIndex: 'date', width: 100 },
    { title: '类别', dataIndex: 'account', width: 100, render: v => <Tag>{v}</Tag> },
    { title: '来源', dataIndex: 'source', width: 100 },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Badge status={v === 'confirmed' ? 'success' : 'warning'} text={v === 'confirmed' ? '已确认' : '待确认'} /> },
    { title: '操作', width: 80, render: (_, r) => (
      <Button type="link" icon={<EyeOutlined />} onClick={() => message.info(`查看 ${r.name} 详情`)} />
    )}
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>财务管理</Title>
          <Text type="secondary">收支管理 · 成本核算 · 智能对账</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>导出报表</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>记一笔</Button>
        </Space>
      </div>

      {/* KPI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '本月收入(万)', value: stats.income, icon: '💰', color: '#52c41a', change: '+12%' },
          { label: '本月支出(万)', value: stats.expense, icon: '📤', color: '#ff4d4f', change: '+5%' },
          { label: '本月利润(万)', value: stats.profit, icon: '📈', color: '#1890ff', change: '+18%' },
          { label: '应收账款(万)', value: stats.ar, icon: '⏳', color: '#faad14', change: '-3%' },
          { label: '回款率', value: stats.arRate, icon: '🎯', color: '#722ed1', change: '+2%' },
        ].map((s, i) => (
          <Col xs={12} sm={8} md={4.8} key={i}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: s.change.startsWith('+') ? '#52c41a' : '#ff4d4f' }}>
                    {s.change.startsWith('+') ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {s.change}
                  </div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tab内容 */}
      <Tabs defaultActiveKey="transactions" items={[
        {
          key: 'transactions',
          label: '📝 收支流水',
          children: (
            <Card style={{ borderRadius: 12 }}>
              <Space style={{ marginBottom: 16 }}>
                <Select value={filterType} onChange={setFilterType} style={{ width: 120 }} options={[
                  { value: 'all', label: '全部' },
                  { value: 'income', label: '收入' },
                  { value: 'expense', label: '支出' }
                ]} />
              </Space>
              <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
            </Card>
          )
        },
        {
          key: 'analysis',
          label: '📊 财务分析',
          children: (
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Card title="收支趋势" style={{ borderRadius: 12 }}>
                  <ReactECharts option={{
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['收入', '支出'], bottom: 0 },
                    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
                    xAxis: { type: 'category', data: monthlyData.months },
                    yAxis: { type: 'value', name: '万元' },
                    series: [
                      { name: '收入', type: 'bar', data: monthlyData.income, itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] } },
                      { name: '支出', type: 'bar', data: monthlyData.expense, itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] } }
                    ]
                  }} style={{ height: 280 }} />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="成本构成" style={{ borderRadius: 12 }}>
                  <ReactECharts option={{
                    tooltip: { trigger: 'item' },
                    series: [{
                      type: 'pie', radius: ['35%', '70%'], center: ['50%', '55%'],
                      data: categories,
                      label: { show: false },
                      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
                    }]
                  }} style={{ height: 200 }} />
                  <div style={{ marginTop: 12 }}>
                    {categories.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <Space size={4}><div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />{c.name}</Space>
                        <Text type="secondary">{c.value}万</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'budget',
          label: '💰 预算管理',
          children: (
            <Card style={{ borderRadius: 12 }}>
              <Typography.Title level={5}>2026年度预算执行</Typography.Title>
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {[
                  { name: '人工成本', budget: 360, used: 185, pct: 51 },
                  { name: '设备采购', budget: 120, used: 68, pct: 57 },
                  { name: '办公费用', budget: 48, used: 28, pct: 58 },
                  { name: '市场推广', budget: 36, used: 15, pct: 42 },
                  { name: '税费支出', budget: 80, used: 42, pct: 53 }
                ].map((b, i) => (
                  <Col span={12} key={i}>
                    <Card size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>{b.name}</Text>
                        <Text type="secondary">{b.used}/{b.budget}万 ({b.pct}%)</Text>
                      </div>
                      <Progress percent={b.pct} status={b.pct > 80 ? 'exception' : 'normal'} showInfo={false} />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )
        }
      ]} />

      {/* 记账弹窗 */}
      <Modal title="记一笔" open={modalOpen} onOk={async () => {
        try {
          const values = await form.validateFields()
          const newTx = {
            id: `SR${dayjs().format('YYYYMMDD')}${String(transactions.length + 1).padStart(3, '0')}`,
            ...values,
            status: 'pending',
            date: dayjs().format('YYYY-MM-DD')
          }
          setTransactions([newTx, ...transactions])
          setModalOpen(false)
          message.success('记录成功')
        } catch {}
      }} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[{ value: 'income', label: '收入' }, { value: 'expense', label: '支出' }]} />
          </Form.Item>
          <Form.Item name="name" label="摘要" rules={[{ required: true }]}>
            <Input placeholder="请输入摘要" />
          </Form.Item>
          <Form.Item name="amount" label="金额(元)" rules={[{ required: true }]}>
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item name="account" label="类别">
            <Select options={['项目款', '咨询服务', '人力成本', '设备维护', '检测耗材', '管理费用', '税费支出'].map(v => ({ value: v, label: v }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
