import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Alert } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'
const { Title, Text } = Typography

export default function Qualifications() {
  const { token } = useStore()
  const [quals, setQuals] = useState([])
  const [stats, setStats] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewModal, setViewModal] = useState(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const types = ['CMA', '质量检测', '安全许可', '质量体系', '行业资质', '其他']

  useEffect(() => {
    loadQuals()
    loadStats()
  }, [])

  const loadQuals = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/qualifications', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setQuals(data || [])
    } catch (e) { console.error(e) }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stats/qualifications', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setStats(data)
    } catch (e) {}
  }

  const handleOpen = (record) => {
    if (record) {
      setEditing(record)
      form.setFieldsValue({ ...record, issue_date: record.issue_date ? record.issue_date.split('T')[0] : null, expiry_date: record.expiry_date ? record.expiry_date.split('T')[0] : null })
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
      const url = editing ? `http://localhost:8000/api/qualifications/${editing.id}` : 'http://localhost:8000/api/qualifications'
      const method = editing ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...vals, id: editing?.id }) })
      message.success(editing ? '资质更新成功' : '资质创建成功')
      setModalOpen(false)
      loadQuals()
      loadStats()
    } catch (e) { message.error('操作失败') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/qualifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      message.success('资质已删除')
      loadQuals()
      loadStats()
    } catch (e) { message.error('删除失败') }
  }

  const getDaysColor = (days) => {
    if (days === null) return '#8c8c8c'
    if (days < 0) return '#ff4d4f'
    if (days <= 90) return '#ff4d4f'
    if (days <= 180) return '#fa8c16'
    return '#52c41a'
  }

  const columns = [
    { title: '编号', dataIndex: 'id', width: 90 },
    { title: '资质名称', dataIndex: 'name', render: v => <Text strong>{v}</Text> },
    { title: '类型', dataIndex: 'type', width: 90, render: v => <Tag color="blue">{v}</Tag> },
    { title: '证书编号', dataIndex: 'cert_no', width: 160, render: v => <Text code style={{ fontSize: 11 }}>{v}</Text> },
    { title: '发证机关', dataIndex: 'issuer', width: 120 },
    { title: '发证日期', dataIndex: 'issue_date', width: 100 },
    { title: '到期日期', dataIndex: 'expiry_date', width: 100, render: v => v ? <span style={{ color: v < new Date().toISOString().slice(0,10) ? '#ff4d4f' : '#52c41a' }}>{v}</span> : '-' },
    { title: '剩余天数', dataIndex: 'days_left', width: 90, render: v => v === null ? <Text type="secondary">-</Text> : <Text style={{ color: getDaysColor(v), fontWeight: 600 }}>{v}天</Text> },
    { title: '状态', width: 90, render: (_, r) => r.is_expired
      ? <Tag color="red">已过期</Tag>
      : r.is_expiring ? <Tag color="orange">即将到期</Tag>
      : <Tag color="green">有效</Tag> },
    { title: '备注', dataIndex: 'renewal_note', width: 140, render: v => v ? <Text style={{ fontSize: 11, color: '#fa8c16' }}>{v}</Text> : '-' },
    { title: '操作', width: 120, render: (_, r) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} onClick={() => setViewModal(r)} />
        <Button size="small" icon={<EditOutlined />} onClick={() => handleOpen(r)} />
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ]

  const chartData = quals.filter(q => q.status === 'active').map(q => ({
    name: q.name.substring(0, 12),
    value: q.days_left || 0,
    itemStyle: { color: getDaysColor(q.days_left) }
  }))

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>资质证书管理</Title>
          <Text type="secondary">公司各类资质证书、认证证书的有效期跟踪与管理</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpen(null)}>新建资质</Button>
      </div>

      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            { label: '资质总数', sub: '全部证书', value: stats.total, color: '#1890ff' },
            { label: '有效证书', sub: '当前有效', value: stats.active, color: '#52c41a' },
            { label: '30天内到期', sub: '紧急续期', value: stats.expiring_30, color: '#ff4d4f' },
            { label: '180天内到期', sub: '提前准备', value: stats.expiring_180, color: '#fa8c16' },
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

      {quals.some(q => q.is_expired) && (
        <Alert type="error" showIcon message="存在已过期资质，请立即处理！" style={{ marginBottom: 16, borderRadius: 8 }} />
      )}
      {quals.some(q => q.is_expiring && !q.is_expired) && (
        <Alert type="warning" showIcon message={`有 ${quals.filter(q => q.is_expiring && !q.is_expired).length} 项资质将在180天内到期，请提前准备续期`} style={{ marginBottom: 16, borderRadius: 8 }} />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
            <Table dataSource={quals} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} size="small" scroll={{ x: 1300 }} locale={{ emptyText: '暂无资质数据' }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><ClockCircleOutlined /> 资质到期分布</>} style={{ borderRadius: 12, marginBottom: 16 }}>
            <ReactECharts option={{
              tooltip: { trigger: 'item', formatter: '{b}: {c}天' },
              series: [{ type: 'pie', radius: ['35%', '65%'], avoidLabelOverlap: false, label: { fontSize: 11 }, data: chartData.length ? chartData : [{ value: 1, name: '暂无数据', itemStyle: { color: '#d9d9d9' } }] }]
            }} style={{ height: 220 }} />
          </Card>
          <Card title={<><ExclamationCircleOutlined /> 到期预警</>} style={{ borderRadius: 12 }}>
            {quals.filter(q => q.is_expiring || q.is_expired).sort((a, b) => (a.days_left || 999) - (b.days_left || 999)).map(q => (
              <div key={q.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 12 }}>{q.name}</Text>
                  {q.is_expired
                    ? <Tag color="red" style={{ fontSize: 10 }}>已过期</Tag>
                    : <Tag color="orange" style={{ fontSize: 10 }}>{q.days_left}天</Tag>}
                </div>
                {q.renewal_note && <Text style={{ fontSize: 11, color: '#fa8c16' }}>{q.renewal_note}</Text>}
              </div>
            ))}
            {quals.filter(q => q.is_expiring || q.is_expired).length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>所有资质均在有效期内</Text>}
          </Card>
        </Col>
      </Row>

      <Modal title={editing ? `编辑资质` : '新建资质'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} confirmLoading={submitting} width={650} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="资质名称" rules={[{ required: true }]}>
                <Input placeholder="如：检验检测机构资质认定证书" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                <Select options={types.map(t => ({ value: t, label: t }))} placeholder="选择类型" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="cert_no" label="证书编号">
            <Input placeholder="证书编号" />
          </Form.Item>
          <Form.Item name="issuer" label="发证机关">
            <Input placeholder="如：省市场监督管理局" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="issue_date" label="发证日期">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiry_date" label="到期日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="scope" label="资质范围">
            <TextArea rows={3} placeholder="资质证书覆盖的检测范围..." />
          </Form.Item>
          <Form.Item name="renewal_note" label="续期备注">
            <Input placeholder="续期注意事项或提醒" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={<><CheckCircleOutlined /> 资质详情</>} open={!!viewModal} onCancel={() => setViewModal(null)} footer={null} width={600}>
        {viewModal && (
          <div>
            <Space wrap style={{ marginBottom: 16 }}>
              <Tag color="blue">{viewModal.type}</Tag>
              {viewModal.is_expired ? <Tag color="red">已过期</Tag> : viewModal.is_expiring ? <Tag color="orange">即将到期</Tag> : <Tag color="green">有效</Tag>}
              {viewModal.days_left !== null && <Tag color={getDaysColor(viewModal.days_left)}>{viewModal.days_left}天到期</Tag>}
            </Space>
            <div style={{ lineHeight: 2 }}>
              <div><Text strong>资质名称：</Text>{viewModal.name}</div>
              <div><Text strong>证书编号：</Text><Text code>{viewModal.cert_no}</Text></div>
              <div><Text strong>发证机关：</Text>{viewModal.issuer}</div>
              <div><Text strong>发证日期：</Text>{viewModal.issue_date}</div>
              <div><Text strong>到期日期：</Text>{viewModal.expiry_date}</div>
              {viewModal.scope && <div><Text strong>资质范围：</Text><br /><Text style={{ whiteSpace: 'pre-wrap' }}>{viewModal.scope}</Text></div>}
              {viewModal.renewal_note && <div><Text strong>续期备注：</Text><br /><Text style={{ color: '#fa8c16' }}>{viewModal.renewal_note}</Text></div>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
