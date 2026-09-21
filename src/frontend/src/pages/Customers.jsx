import { useState } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Typography, message } from 'antd'
import { RobotOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const typeMap = { '房地产开发商': 'blue', '政府机关': 'green', '工业企业': 'orange', '医疗机构': 'cyan', '建筑施工': 'purple', '工商企业': 'purple', '服务行业': 'gray' }

export default function Customers() {
  const { customers: customersData, fetchCustomers, createCustomer } = useStore()
  const [searchText, setSearchText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const filtered = customersData.filter(c => {
    if (!searchText) return true
    return c.name?.includes(searchText) || c.id?.includes(searchText) || c.contact?.includes(searchText)
  })

  const stats = {
    total: filtered.length,
    topClients: filtered.filter(c => c.rating >= 4).length,
    totalAmount: filtered.reduce((s, c) => s + (c.amount || 0), 0),
    active: filtered.filter(c => c.status === 'active').length
  }

  const columns = [
    { title: '客户编号', dataIndex: 'id', width: 90 },
    { title: '客户名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '类型', dataIndex: 'type', width: 100, render: v => <Tag color={typeMap[v] || 'default'}>{v || '-'}</Tag> },
    { title: '联系人', dataIndex: 'contact', width: 90 },
    { title: '联系电话', dataIndex: 'phone', width: 120 },
    { title: '累计项目', dataIndex: 'projects', width: 80, align: 'center' },
    { title: '累计金额(万)', dataIndex: 'amount', width: 110, align: 'right', render: v => <Text style={{ color: '#1890ff', fontWeight: 600 }}>{v ? (v/10000).toFixed(1) : 0}</Text> },
    { title: '满意度', width: 100, render: (_, r) => <Space size={1}>{[1,2,3,4,5].map(i => <StarOutlined key={i} style={{ color: i <= (r.rating||3) ? '#faad14' : '#d9d9d9', fontSize: 12 }} />)}</Space> },
    { title: '最近联系', dataIndex: 'last_contact', width: 100 },
    { title: '状态', dataIndex: 'status', width: 80, render: v => <Tag color={v==='active'?'green':'default'}>{v==='active'?'活跃':'停用'}</Tag> },
  ]

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setSubmitting(true)
      await createCustomer(form.getFieldsValue())
      setModalOpen(false)
      form.resetFields()
      message.success('客户添加成功')
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>客户管理</Title>
          <Text type="secondary">客户档案 | 商机管理 | 服务跟进</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>AI商机分析</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加客户</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '客户总数', value: stats.total, icon: '👥', color: '#1890ff' },
          { label: '优质客户', value: stats.topClients, icon: '⭐', color: '#faad14' },
          { label: '累计金额(万)', value: (stats.totalAmount/10000).toFixed(1), icon: '💰', color: '#52c41a' },
          { label: '活跃客户', value: stats.active, icon: '✅', color: '#722ed1' },
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

      <Card style={{ borderRadius: 12 }}>
        <Space style={{ marginBottom: 16 }}>
          <Search placeholder="搜索客户名称/编号" value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} style={{ width: 240 }} />
        </Space>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1100 }} loading={customersData.length === 0} />
      </Card>

      <Modal title="添加客户" open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); form.resetFields() }} confirmLoading={submitting} width={560}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
                <Input placeholder="请输入客户名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="客户类型" rules={[{ required: true }]}>
                <Select options={['房地产开发商','政府机关','工业企业','医疗机构','建筑施工','工商企业','服务行业'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact" label="联系人" rules={[{ required: true }]}>
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="电话"><Input placeholder="请输入联系电话" /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="邮箱"><Input placeholder="请输入邮箱" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
