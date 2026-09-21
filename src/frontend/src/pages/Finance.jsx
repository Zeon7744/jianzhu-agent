import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Statistic, Progress, Typography, message } from 'antd'
import { PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined, WalletOutlined, AccountBookOutlined, BarChartOutlined, RobotOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const monthlyData = {
  months: ['1月','2月','3月','4月','5月','6月','7月'],
  income: [45, 52, 48, 61, 55, 68, 72],
  expense: [32, 35, 33, 40, 38, 42, 45]
}
const categories = [
  { name: '项目收入', value: 420, color: '#52c41a' },
  { name: '咨询服务', value: 85, color: '#1890ff' },
  { name: '人力成本', value: 95, color: '#ff4d4f' },
  { name: '设备折旧', value: 38, color: '#faad14' },
  { name: '管理费用', value: 28, color: '#722ed1' }
]

export default function Finance() {
  const { transactions, fetchTransactions, createTransaction } = useStore()
  const [filterType, setFilterType] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const [financeStats, setFinanceStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    fetchTransactions()
    ;(async () => {
      try {
        setStatsLoading(true)
        const res = await fetch('http://localhost:8000/api/finance/stats')
        const data = await res.json()
        setFinanceStats(data)
      } catch(e) { console.error('Finance stats fetch failed', e) }
      finally { setStatsLoading(false) }
    })()
  }, [])

  const filtered = transactions.filter(t => {
    const matchType = filterType === 'all' || t.type === filterType
    const matchSearch = !searchText || t.name?.includes(searchText) || t.id?.includes(searchText)
    return matchType && matchSearch
  })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) / 10000
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0) / 10000
  const arAmount = transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((s, t) => s + (t.amount || 0), 0) / 10000
  const monthIncome = transactions.filter(t => t.type === 'income' && t.date?.startsWith('2026-09')).reduce((s, t) => s + (t.amount || 0), 0) / 10000
  const monthExpense = transactions.filter(t => t.type === 'expense' && t.date?.startsWith('2026-09')).reduce((s, t) => s + (t.amount || 0), 0) / 10000

  const stats = financeStats ? {
    income: financeStats.month_income,
    expense: financeStats.month_expense,
    profit: financeStats.profit,
    ar: financeStats.ar_amount,
    arRate: (financeStats.collection_rate || 0) + '%',
    profitRate: financeStats.profit_rate + '%',
    totalIncome: financeStats.total_income,
    totalExpense: financeStats.total_expense
  } : {
    income: monthIncome,
    expense: monthExpense,
    profit: (monthIncome - monthExpense),
    ar: arAmount,
    arRate: '82%',
    profitRate: '85%',
    totalIncome,
    totalExpense
  }

  const columns = [
    { title: '流水号', dataIndex: 'id', width: 120 },
    { title: '摘要', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '金额(万)', width: 110, render: (_, r) => <Text style={{ color: r.type === 'income' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>{r.type === 'income' ? '+' : '-'}{(r.amount / 10000).toFixed(1)}</Text> },
    { title: '日期', dataIndex: 'date', width: 100 },
    { title: '类别', dataIndex: 'account', width: 100, render: v => <Tag>{v}</Tag> },
    { title: '来源', dataIndex: 'source', width: 100 },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Badge status={v === 'confirmed' ? 'success' : 'warning'} text={v === 'confirmed' ? '已确认' : '待确认'} /> },
    { title: '操作', width: 80, render: () => <Button type="link" icon={<EyeOutlined />} /> }
  ]

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await createTransaction({ ...values, date: new Date().toISOString().split('T')[0] })
      setModalOpen(false)
      form.resetFields()
      message.success('记录成功')
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>财务管理</Title>
          <Text type="secondary">收支管理 | 成本核算 | 智能对账</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>导出报表</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>记一笔</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '本月收入(万)', value: stats.income.toFixed(1), icon: '\U0001F4B5', color: '#52c41a', change: '+12%' },
          { label: '本月支出(万)', value: stats.expense.toFixed(1), icon: '\U0001F4B3', color: '#ff4d4f', change: '+5%' },
          { label: '本月利润(万)', value: stats.profit.toFixed(1), icon: '\U0001F4C1', color: '#1890ff', change: '+18%' },
          { label: '应收账款(万)', value: stats.ar.toFixed(1), icon: '\u23F0', color: '#faad14', change: '-3%' },
          { label: '回款率', value: stats.arRate, icon: '\U0001F504', color: '#722ed1', change: '+2%' },
        ].map((s, i) => (
          <Col xs={12} sm={8} md={4.8} key={i}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: s.change.startsWith('+') ? '#52c41a' : '#ff4d4f' }}>{s.change}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title={<><span>\U0001F4E3</span><span>收支流水</span></>} style={{ borderRadius: 12 }}>
            <Space style={{ marginBottom: 16 }}>
              <Search placeholder="搜索摘要/流水号" style={{ width: 200 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
              <Select value={filterType} onChange={setFilterType} style={{ width: 120 }} options={[{ value: 'all', label: '全部' }, { value: 'income', label: '收入' }, { value: 'expense', label: '支出' }]} />
            </Space>
            <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={transactions.length === 0} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={<><span>\U0001F4CA</span><span>财务分析</span></>} style={{ borderRadius: 12, marginBottom: 16 }}>
            <ReactECharts option={{
              tooltip: { trigger: 'axis' },
              legend: { data: ['收入', '支出'], bottom: 0 },
              grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
              xAxis: { type: 'category', data: (financeStats?.monthly_trend?.months || ['6月','7月','8月','9月']) },
              yAxis: { type: 'value', name: '万元' },
              series: [
                { name: '收入', type: 'bar', data: financeStats?.monthly_trend?.income || [15,37.5,89,298.7], itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] } },
                { name: '支出', type: 'bar', data: financeStats?.monthly_trend?.expense || [2.2,3.3,14.7,47.3], itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] } }
              ]
            }} style={{ height: 200 }} />
          </Card>
          <Card title={<><span>\U0001F4B5</span><span>成本构成</span></>} style={{ borderRadius: 12 }}>
            <ReactECharts option={{
              tooltip: { trigger: 'item' },
              series: [{
                type: 'pie', radius: ['35%', '70%'], center: ['50%', '55%'],
                data: Object.entries(financeStats?.expense_by_account || {}).map(([name, value], i) => ({
                  name, value,
                  itemStyle: { color: ['#ff4d4f','#faad14','#722ed1','#1890ff','#52c41a','#eb2f96','#13c2c2','#2f4554'][i % 8] }
                })),
                label: { show: false }
              }]
            }} style={{ height: 160 }} />
            <div style={{ marginTop: 12 }}>
              {Object.entries(financeStats?.expense_by_account || {'人力成本':42.2,'管理费用':8.4,'耗材采购':7,'设备维护':3.2,'设备检定':3,'交通费用':1.5,'设备维修':2.2}).map(([name, value], i) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <Space size={4}><div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#ff4d4f','#faad14','#722ed1','#1890ff','#52c41a','#eb2f96','#13c2c2','#2f4554'][i % 8] }} />{name}</Space>
                  <Text type="secondary">{value}万</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal title="记一笔" open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); form.resetFields() }} confirmLoading={submitting} width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true }]}><Select options={[{ value: 'income', label: '收入' }, { value: 'expense', label: '支出' }]} /></Form.Item>
          <Form.Item name="name" label="摘要" rules={[{ required: true }]}><Input placeholder="请输入摘要" /></Form.Item>
          <Form.Item name="amount" label="金额(元)" rules={[{ required: true, message: '请输入金额' }]}><Input type="number" placeholder="0" /></Form.Item>
          <Form.Item name="account" label="类别"><Select options={['项目款','咨询服务','人力成本','设备维护','检测耗材','管理费用','税费支出'].map(v => ({ value: v, label: v }))} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
