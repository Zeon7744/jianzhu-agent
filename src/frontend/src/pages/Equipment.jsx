import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Tooltip, Badge, Typography, message } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, RobotOutlined, ToolOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

export default function Equipment() {
  const { equipment: equipmentData, fetchEquipment, createEquipment } = useStore()
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEquipment()
  }, [])

  const filtered = equipmentData.filter(e => {
    const matchSearch = e.name?.includes(searchText) || e.id?.includes(searchText)
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: filtered.length,
    normal: filtered.filter(e => e.status === 'normal').length,
    warning: filtered.filter(e => e.status === 'warning').length,
    totalValue: filtered.reduce((s, e) => s + (e.value || 0), 0) / 10000
  }

  const statusMap = { normal: { label: '正常', color: 'green' }, warning: { label: '需检定', color: 'orange' }, maintenance: { label: '维修中', color: 'red' }, borrowed: { label: '外借', color: 'blue' } }

  const columns = [
    { title: '设备编号', dataIndex: 'id', width: 90 },
    { title: '设备名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '型号', dataIndex: 'model', width: 100 },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label || v}</Tag> },
    { title: '存放位置', dataIndex: 'location', width: 120 },
    { title: '检定状态', dataIndex: 'cert_status', width: 90, render: v => v === '有效' ? <Badge status="success" text="有效" /> : <Badge status="warning" text={v} /> },
    { title: '检定到期', dataIndex: 'cert_due', width: 100, render: v => { const days = dayjs(v).diff(dayjs(), 'day'); return <Tooltip title={days + '天后到期'}><Text style={{ color: (days < 30 && days > 0) ? '#ff4d4f' : '#52c41a' }}>{v}</Text></Tooltip>; }},
    { title: '下次保养', dataIndex: 'next_maint', width: 100 },
    { title: '原值(万)', width: 90, align: 'right', render: (_, r) => ((r.value || 0) / 10000).toFixed(1) },
    { title: '操作', width: 100, render: () => <Space size="small"><Button type="text" icon={<EyeOutlined />} /><Button type="text" icon={<EditOutlined />} /></Space> }
  ]

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await createEquipment(values)
      setModalOpen(false)
      form.resetFields()
      message.success('设备添加成功')
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>设备管理</Title>
          <Text type="secondary">设备台账 | 检定追踪 | 预测性维护</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>AI维护预测</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加设备</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '设备总数', value: stats.total, icon: '\U0001F527', color: '#1890ff' },
          { label: '正常可用', value: stats.normal, icon: '\u2705', color: '#52c41a' },
          { label: '需检定', value: stats.warning, icon: '\u26A0\uFE0F', color: '#faad14' },
          { label: '设备总值(万)', value: stats.totalValue.toFixed(1), icon: '\U0001F4B5', color: '#722ed1' },
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

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Search placeholder="搜索设备名/编号" style={{ width: 200 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }} options={[{ value: 'all', label: '全部状态' }, { value: 'normal', label: '正常' }, { value: 'warning', label: '需检定' }, { value: 'maintenance', label: '维修中' }]} />
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1100 }} loading={equipmentData.length === 0} />
      </Card>

      <Modal title="添加设备" open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); form.resetFields() }} confirmLoading={submitting} width={560}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="设备名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="model" label="型号"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="location" label="存放位置"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="value" label="原值"><Input type="number" /></Form.Item></Col>
          </Row>
          <Form.Item name="cert_due" label="检定到期日"><Input type="date" /></Form.Item>
          <Form.Item name="next_maint" label="下次保养日期"><Input type="date" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
