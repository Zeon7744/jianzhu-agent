import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Typography, Badge, Progress } from 'antd'
import { PlusOutlined, SearchOutlined, FileTextOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const STATUS_MAP = {
  pending: { label: '待签约', color: 'orange' },
  signed: { label: '已签约', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'default' },
}

export default function Contracts() {
  const { user } = useStore()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/api/contracts')
      .then(r => r.json())
      .then(data => { setContracts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = contracts.filter(ct => {
    const matchType = filterType === 'all' || ct.type === filterType
    const matchSearch = !searchText || ct.name?.includes(searchText) || ct.id?.includes(searchText)
    return matchType && matchSearch
  })

  const totalAmount = contracts.reduce((s, ct) => s + (ct.amount || 0), 0) / 10000
  const signedAmount = contracts.filter(ct => ct.status === 'signed').reduce((s, ct) => s + (ct.amount || 0), 0) / 10000
  const pendingAmount = contracts.filter(ct => ct.status === 'pending').reduce((s, ct) => s + (ct.amount || 0), 0) / 10000

  const columns = [
    { title: '合同编号', dataIndex: 'id', width: 130, render: v => <Text strong style={{ color: '#1890ff' }}>{v}</Text> },
    { title: '合同名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '关联项目', dataIndex: 'project_id', width: 110 },
    { title: '合同金额(万)', width: 100, render: (_, r) => <Text style={{ color: '#52c41a', fontWeight: 600 }}>{(r.amount / 10000).toFixed(1)}</Text> },
    { title: '类型', dataIndex: 'type', width: 100, render: v => <Tag color={v === '装修检测' ? 'purple' : v === '鉴定服务' ? 'geekblue' : 'blue'}>{v}</Tag> },
    { title: '签署日期', dataIndex: 'sign_date', width: 100 },
    { title: '到期日期', dataIndex: 'end_date', width: 100, render: v => {
      if (!v) return '-'
      const days = Math.ceil((new Date(v) - new Date()) / 86400000)
      return <span style={{ color: days < 30 ? '#ff4d4f' : '#52c41a' }}>{v}{days > 0 ? ` (${days}天)` : ''}</span>
    }},
    { title: '状态', dataIndex: 'status', width: 90, render: v => {
      const m = STATUS_MAP[v] || { label: v, color: 'default' }
      return <Badge status={m.color === 'green' ? 'success' : m.color === 'orange' ? 'warning' : m.color === 'blue' ? 'processing' : 'default'} text={m.label} />
    }},
    { title: '付款条款', dataIndex: 'payment_terms', ellipsis: true, render: v => <Text ellipsis={{ tooltip: v }} style={{ fontSize: 12 }}>{v}</Text> },
  ]

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      const res = await fetch('http://localhost:8000/api/contracts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values)
      })
      const data = await res.json()
      setContracts(prev => [...prev, data])
      setModalOpen(false)
      form.resetFields()
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>合同管理</Title>
          <Text type="secondary">合同台账 | 签署追踪 | 回款管理</Text>
        </div>
        <Space>
          <Button icon={<SearchOutlined />} onClick={() => document.getElementById('contract-search')?.focus()}>搜索</Button>
          {user?.role !== 'guest' && <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建合同</Button>}
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '合同总额(万)', value: totalAmount.toFixed(1), icon: '\u{1F4B0}', color: '#1890ff' },
          { label: '已签约(万)', value: signedAmount.toFixed(1), icon: '\u{2705}', color: '#52c41a' },
          { label: '待签约(万)', value: pendingAmount.toFixed(1), icon: '\u{23F0}', color: '#faad14' },
          { label: '合同数量', value: contracts.length, icon: '\u{1F4C4}', color: '#722ed1' },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Search id="contract-search" placeholder="搜索合同编号/名称" style={{ width: 220 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterType} onChange={setFilterType} style={{ width: 140 }} options={[
            { value: 'all', label: '全部类型' },
            { value: '检测服务', label: '检测服务' },
            { value: '鉴定服务', label: '鉴定服务' },
            { value: '装修检测', label: '装修检测' },
          ]} />
        </Space>
        <Table dataSource={filtered} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, showTotal: total => `共 ${total} 条` }}
          scroll={{ x: 1000 }} />
      </Card>

      <Modal title="新建合同" open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); form.resetFields() }} confirmLoading={submitting} width={560}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="合同名称" rules={[{ required: true }]}>
            <Input placeholder="请输入合同名称" />
          </Form.Item>
          <Form.Item name="type" label="合同类型">
            <Select options={['检测服务','鉴定服务','装修检测','咨询服务','贸易合同'].map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="project_id" label="关联项目"><Input placeholder="项目编号" /></Form.Item>
          <Form.Item name="customer_id" label="客户编号"><Input placeholder="客户编号" /></Form.Item>
          <Form.Item name="amount" label="合同金额(元)" rules={[{ required: true, type: 'number' }]}>
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item name="sign_date" label="签署日期"><Input type="date" /></Form.Item>
          <Form.Item name="start_date" label="开始日期"><Input type="date" /></Form.Item>
          <Form.Item name="end_date" label="到期日期"><Input type="date" /></Form.Item>
          <Form.Item name="payment_terms" label="付款条款"><Input.TextArea rows={2} placeholder="如：合同签订后7日内付50%，报告交付后付尾款" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
