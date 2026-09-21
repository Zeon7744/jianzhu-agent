import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Modal, Form, Input, Select, DatePicker, message, Popconfirm } from 'antd'
import { PlusOutlined, FileTextOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, FilterOutlined } from '@ant-design/icons'
import { useStore } from '../store'
const { Title, Text } = Typography
const { TextArea } = Input

export default function Policies() {
  const { token } = useStore()
  const [policies, setPolicies] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [viewModal, setViewModal] = useState(null)

  const categories = ['总则', '人事', '财务', '业务', '质量', '安全', '设备', '综合']

  useEffect(() => {
    loadPolicies()
    loadStats()
  }, [])

  const loadPolicies = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/policies${filter !== 'all' ? `?category=${filter}` : ''}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setPolicies(data || [])
    } catch (e) { console.error(e) }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stats/policies', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setStats(data)
    } catch (e) {}
  }

  const handleOpen = (record) => {
    if (record) {
      setEditing(record)
      form.setFieldsValue(record)
    } else {
      setEditing(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const vals = await form.validateFields()
    setSubmitting(true)
    try {
      const url = editing ? `http://localhost:8000/api/policies/${editing.id}` : 'http://localhost:8000/api/policies'
      const method = editing ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...vals, id: editing?.id }) })
      message.success(editing ? '制度更新成功' : '制度创建成功')
      setModalOpen(false)
      loadPolicies()
      loadStats()
    } catch (e) { message.error('操作失败') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/policies/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      message.success('制度已删除')
      loadPolicies()
      loadStats()
    } catch (e) { message.error('删除失败') }
  }

  const columns = [
    { title: '编号', dataIndex: 'id', width: 100 },
    { title: '制度名称', dataIndex: 'title', render: v => <Text strong>{v}</Text> },
    { title: '类别', dataIndex: 'category', width: 80, render: v => <Tag color="blue">{v}</Tag> },
    { title: '层级', dataIndex: 'level', width: 80, render: v => <Tag color={v === 'company' ? 'gold' : 'purple'}>{v === 'company' ? '公司级' : '部门级'}</Tag> },
    { title: '部门', dataIndex: 'department', width: 90 },
    { title: '版本', dataIndex: 'version', width: 70 },
    { title: '生效日期', dataIndex: 'effective_date', width: 100 },
    { title: '到期日期', dataIndex: 'expiry_date', width: 100, render: v => v ? (
      <span style={{ color: new Date(v) < new Date() ? '#ff4d4f' : '#52c41a' }}>{v}</span>
    ) : '-' },
    { title: '状态', dataIndex: 'status', width: 80, render: v => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '有效' : '已废止'}</Tag> },
    { title: '操作', width: 140, render: (_, r) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} onClick={() => setViewModal(r)} />
        {(r.level === 'company' || true) && <Button size="small" icon={<EditOutlined />} onClick={() => handleOpen(r)} />}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>公司制度管理</Title>
          <Text type="secondary">公司规章制度、管理制度、流程规范的统一管理平台</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpen(null)}>新建制度</Button>
      </div>

      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            { label: '制度总数', sub: '全部制度文件', value: stats.total, color: '#1890ff' },
            { label: '有效制度', sub: '当前生效中', value: stats.active, color: '#52c41a' },
            { label: '即将到期', sub: '90天内需复审', value: stats.expiring_soon, color: '#fa8c16' },
            { label: '已废止', sub: '历史制度', value: stats.expired, color: '#8c8c8c' },
          ].map((s, i) => (
            <Col xs={12} sm={6} key={i}>
              <Card style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{s.sub}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Card style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space>
          <FilterOutlined style={{ color: '#8c8c8c' }} />
          <Button size="small" type={filter === 'all' ? 'primary' : 'default'} onClick={() => setFilter('all')}>全部</Button>
          {categories.map(c => (
            <Button key={c} size="small" type={filter === c ? 'primary' : 'default'} onClick={() => setFilter(c)}>{c}</Button>
          ))}
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={policies}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 1200 }}
          locale={{ emptyText: '暂无制度数据' }}
        />
      </Card>

      <Modal
        title={editing ? `编辑制度 - ${editing.title}` : '新建制度'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        width={700}
        okText="保存" cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="制度名称" rules={[{ required: true }]}>
                <Input placeholder="请输入制度名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="类别" rules={[{ required: true }]}>
                <Select options={categories.map(c => ({ value: c, label: c }))} placeholder="选择类别" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="level" label="层级">
                <Select options={[{ value: 'company', label: '公司级' }, { value: 'department', label: '部门级' }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="归属部门">
                <Select options={[{ value: '总经理办公室', label: '总经理办公室' }, { value: '技术部', label: '技术部' }, { value: '检测部', label: '检测部' }, { value: '咨询部', label: '咨询部' }, { value: '安全部', label: '安全部' }, { value: '质量部', label: '质量部' }, { value: '综合部', label: '综合部' }, { value: '财务部', label: '财务部' }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="version" label="版本号">
                <Input prefix="v" placeholder="1.0" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="effective_date" label="生效日期">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiry_date" label="到期日期（可选）">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="author" label="起草人">
                <Input placeholder="起草人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="approver" label="审批人">
                <Input placeholder="审批人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select options={[{ value: 'active', label: '有效' }, { value: 'expired', label: '已废止' }]} />
          </Form.Item>
          <Form.Item name="content" label="制度内容" rules={[{ required: true, message: '请输入制度内容' }]}>
            <TextArea rows={8} placeholder="请输入制度全文内容..." showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<><FileTextOutlined /> {viewModal?.title}</>}
        open={!!viewModal}
        onCancel={() => setViewModal(null)}
        footer={null}
        width={700}
      >
        <div style={{ marginTop: 16 }}>
          <Space wrap style={{ marginBottom: 16 }}>
            {viewModal && <Tag color="blue">{viewModal.category}</Tag>}
            {viewModal && <Tag color={viewModal.level === 'company' ? 'gold' : 'purple'}>{viewModal.level === 'company' ? '公司级' : '部门级'}</Tag>}
            {viewModal && <Tag>{viewModal.department}</Tag>}
            <Tag>版本 {viewModal?.version}</Tag>
            <Tag>{viewModal?.status === 'active' ? '有效' : '已废止'}</Tag>
          </Space>
          <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', padding: '16px', background: '#fafafa', borderRadius: 8, maxHeight: 500, overflow: 'auto' }}>
            {viewModal?.content}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
            起草人：{viewModal?.author} | 审批人：{viewModal?.approver} | 生效日期：{viewModal?.effective_date}
          </div>
        </div>
      </Modal>
    </div>
  )
}
