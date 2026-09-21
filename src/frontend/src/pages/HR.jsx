import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, Avatar, Statistic, Progress, Tooltip, Badge, Typography, message
} from 'antd'
import {
  PlusOutlined, SearchOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, CalendarOutlined, CheckCircleOutlined, RobotOutlined,
  ToolOutlined, BookOutlined, FileTextOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const deptMap = { '技术部': 'blue', '检测部': 'green', '咨询部': 'purple', '财务部': 'orange', '市场部': 'cyan' }

export default function HR() {
  const { staff, fetchStaff, createStaff } = useStore()
  const [searchText, setSearchText] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const filtered = staff.filter(s => {
    const matchSearch = s.name?.includes(searchText) || s.id?.includes(searchText)
    const matchDept = filterDept === 'all' || s.dept === filterDept
    return matchSearch && matchDept
  })

  const stats = {
    total: staff.filter(s => s.status === 'active').length,
    tech: staff.filter(s => s.dept === '技术部' || s.dept === '检测部').length,
    certs: staff.reduce((s, st) => s + (st.certs || []).length, 0),
    avgTenure: '3.2年'
  }

  const columns = [
    { title: '员工信息', width: 180, render: (_, r) => (
      <Space>
        <Avatar style={{ background: '#1890ff', fontSize: 18 }}>{r.avatar || r.name?.charAt(0)}</Avatar>
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.id}</div>
        </div>
      </Space>
    )},
    { title: '部门', dataIndex: 'dept', width: 90, render: v => <Tag color={deptMap[v]}>{v}</Tag> },
    { title: '职位', dataIndex: 'position', width: 100 },
    { title: '资质证书', width: 180, render: (_, r) => (r.certs || []).length > 0 ? (
      <Tooltip title={(r.certs || []).join(', ')}>
        <Space size={4} wrap>
          {(r.certs || []).slice(0, 2).map((c, i) => <Tag key={i} color="blue" style={{ fontSize: 11 }}>{c}</Tag>)}
          {(r.certs || []).length > 2 && <Tag style={{ fontSize: 11 }}>+{(r.certs || []).length - 2}</Tag>}
        </Space>
      </Tooltip>
    ) : <Text type="secondary">无</Text> },
    { title: '入职时间', dataIndex: 'join_date', width: 100 },
    { title: '状态', dataIndex: 'status', width: 80, render: v => <Badge status={v === 'active' ? 'success' : 'default'} text={v === 'active' ? '在职' : '请假'} /> },
    { title: '操作', width: 80, render: (_, r) => (
      <Button type="link" icon={<BookOutlined />} onClick={() => setSelectedStaff(r)}>档案</Button>
    )}
  ]

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await createStaff({ ...values, certs: [] })
      setModalOpen(false)
      form.resetFields()
      message.success('员工添加成功')
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>人力资源</Title>
          <Text type="secondary">人员档案管理 | 资质追踪 | 智能排班</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>AI智能排班</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加员工</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '在职人数', value: stats.total, icon: '\U0001F468‍\U0001F4BC', color: '#1890ff' },
          { label: '技术人员', value: stats.tech, icon: '\U0001F52C', color: '#52c41a' },
          { label: '证书总数', value: stats.certs, icon: '\U0001F4C6', color: '#faad14' },
          { label: '平均司龄', value: stats.avgTenure, icon: '\U0001F4C5', color: '#722ed1' },
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
          <Search placeholder="搜索姓名/工号" style={{ width: 200 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterDept} onChange={setFilterDept} style={{ width: 120 }} options={[
            { value: 'all', label: '全部部门' },
            { value: '技术部', label: '技术部' },
            { value: '检测部', label: '检测部' },
            { value: '咨询部', label: '咨询部' },
            { value: '财务部', label: '财务部' },
            { value: '市场部', label: '市场部' },
          ]} />
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} loading={staff.length === 0} />
      </Card>

      <Modal title="添加员工" open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); form.resetFields() }} confirmLoading={submitting} width={560}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="dept" label="部门" rules={[{ required: true }]}><Select options={['技术部', '检测部', '咨询部', '财务部', '市场部'].map(v => ({ value: v, label: v }))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="position" label="职位" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="手机号"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title={<Space><span>\U0001F4CB</span><span>员工档案</span></Space>} open={!!selectedStaff} onCancel={() => setSelectedStaff(null)} footer={null} width={600}>
        {selectedStaff && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Avatar style={{ background: '#1890ff', width: 64, height: 64, fontSize: 32 }}>{selectedStaff.avatar || selectedStaff.name?.charAt(0)}</Avatar>
              <div>
                <Title level={5} style={{ margin: 0 }}>{selectedStaff.name}</Title>
                <Text type="secondary">{selectedStaff.id} | {selectedStaff.dept} | {selectedStaff.position}</Text>
              </div>
            </Space>
            <Row gutter={[16, 16]}>
              <Col span={12}><Text type="secondary">手机号：</Text><br /><PhoneOutlined /> {selectedStaff.phone}</Col>
              <Col span={12}><Text type="secondary">邮箱：</Text><br /><MailOutlined /> {selectedStaff.email}</Col>
              <Col span={12}><Text type="secondary">入职日期：</Text><br /><CalendarOutlined /> {selectedStaff.join_date}</Col>
              <Col span={12}><Text type="secondary">资质证书：</Text><br /><CheckCircleOutlined /> {(selectedStaff.certs || []).length > 0 ? selectedStaff.certs.join(', ') : '暂无'}</Col>
            </Row>
            <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 8 }}>
              <Text>在职状态：在职</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
