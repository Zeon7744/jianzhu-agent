import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, Statistic, Progress, Tooltip, Badge, Typography, message
} from 'antd'
import {
  PlusOutlined, SearchOutlined, PhoneOutlined, MailOutlined,
  RobotOutlined, StarOutlined, TrophyOutlined, CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'

const { Title, Text } = Typography
const { Search } = Input

const initialCustomers = [
  { id: 'KH001', name: 'XX地产集团', type: '地产开发商', contact: '张经理', phone: '138****1234', email: 'zhang@xx.com', projects: 12, amount: 850, rating: 5, lastContact: '2026-09-10', status: 'active' },
  { id: 'KH002', name: '市交通局', type: '政府机关', contact: '李主任', phone: '139****5678', email: 'li@jt.gov.cn', projects: 8, amount: 1200, rating: 5, lastContact: '2026-09-08', status: 'active' },
  { id: 'KH003', name: 'ZZ街道办', type: '政府机关', contact: '王书记', phone: '137****9012', email: 'wang@zz.gov.cn', projects: 3, amount: 180, rating: 4, lastContact: '2026-09-01', status: 'active' },
  { id: 'KH004', name: '区教育局', type: '政府机关', contact: '赵局长', phone: '136****3456', email: 'zhao@jy.gov.cn', projects: 5, amount: 340, rating: 4, lastContact: '2026-08-25', status: 'active' },
  { id: 'KH005', name: 'BB制造业', type: '工业企业', contact: '刘总', phone: '135****7890', email: 'liu@bb.com', projects: 2, amount: 120, rating: 3, lastContact: '2026-08-20', status: 'active' },
  { id: 'KH006', name: '市第一人民医院', type: '医疗机构', contact: '陈主任', phone: '134****2345', email: 'chen@yy.com', projects: 1, amount: 32, rating: 4, lastContact: '2026-07-15', status: 'active' },
  { id: 'KH007', name: 'AA建设集团', type: '建筑企业', contact: '周经理', phone: '133****6789', email: 'zhou@aa.com', projects: 6, amount: 450, rating: 5, lastContact: '2026-09-12', status: 'active' },
]

const typeMap = { '地产开发商': 'blue', '政府机关': 'green', '工业企业': 'orange', '医疗机构': 'cyan', '建筑企业': 'purple' }

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchText, setSearchText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const filtered = customers.filter(c => c.name.includes(searchText) || c.id.includes(searchText))

  const stats = {
    total: customers.length,
    topClients: customers.filter(c => c.rating >= 4).length,
    totalAmount: customers.reduce((s, c) => s + c.amount, 0),
    thisMonth: 3
  }

  const columns = [
    { title: '客户编号', dataIndex: 'id', width: 90 },
    { title: '客户名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '类型', dataIndex: 'type', width: 90, render: v => <Tag color={typeMap[v]}>{v}</Tag> },
    { title: '联系人', dataIndex: 'contact', width: 80 },
    { title: '联系电话', dataIndex: 'phone', width: 110 },
    { title: '累计项目', dataIndex: 'projects', width: 80, align: 'center' },
    { title: '累计金额(万)', dataIndex: 'amount', width: 100, align: 'right', render: v => <Text style={{ color: '#1890ff', fontWeight: 600 }}>{v}</Text> },
    { title: '满意度', width: 100, render: (_, r) => <Space size={2}>{[...Array(5)].map((_, i) => <StarOutlined key={i} style={{ color: i < r.rating ? '#faad14' : '#d9d9d9' }} />)}</Space> },
    { title: '最近联系', dataIndex: 'lastContact', width: 100 },
    { title: '操作', width: 80, render: () => <Button type="link" icon={<PhoneOutlined />} /> }
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>客户管理</Title>
          <Text type="secondary">客户档案 · 商机管理 · 服务跟进</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>
            AI商机分析
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加客户</Button>
        </Space>
      </div>

      {/* 统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '客户总数', value: stats.total, icon: '🤝', color: '#1890ff' },
          { label: '优质客户', value: stats.topClients, icon: '⭐', color: '#faad14' },
          { label: '累计金额(万)', value: stats.totalAmount, icon: '💰', color: '#52c41a' },
          { label: '本月新增', value: stats.thisMonth, icon: '🆕', color: '#722ed1' },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{s.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 客户列表 */}
      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Search placeholder="搜索客户" style={{ width: 200 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
        </Space>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* 添加客户 */}
      <Modal title="添加客户" open={modalOpen} onOk={async () => {
        try {
          const values = await form.validateFields()
          const newCustomer = { id: `KH${String(customers.length + 1).padStart(3, '0')}`, ...values, projects: 0, amount: 0, rating: 3, lastContact: dayjs().format('YYYY-MM-DD'), status: 'active' }
          setCustomers([newCustomer, ...customers])
          setModalOpen(false)
          message.success('客户添加成功')
        } catch {}
      }} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="客户名称" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="客户类型" rules={[{ required: true }]}><Select options={['地产开发商', '政府机关', '工业企业', '医疗机构', '建筑企业'].map(v => ({ value: v, label: v }))} /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact" label="联系人" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="电话"><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
