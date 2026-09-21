import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, DatePicker, Tooltip, Badge, Typography, message
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, RobotOutlined, DownloadOutlined
} from '@ant-design/icons'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

export default function Projects() {
  const { projects, fetchProjects, createProject, updateProject, deleteProject } = useStore()
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingProject, setEditingProject] = useState(null)

  const filtered = projects.filter(p => {
    const matchSearch = p.name?.includes(searchText) || p.client?.includes(searchText) || p.id?.includes(searchText)
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0),
    totalPaid: projects.reduce((s, p) => s + (p.paid || 0), 0),
    highRisk: projects.filter(p => p.risk === 'high').length
  }

  const statusMap = { pending: ['待开工', 'orange'], active: ['进行中', 'blue'], report: ['报告编制', 'purple'], completed: ['已完成', 'green'] }
  const columns = [
    { title: '项目编号', dataIndex: 'id', width: 120 },
    { title: '项目名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '客户', dataIndex: 'client', width: 120 },
    { title: '类型', dataIndex: 'type', width: 100, render: v => <Tag>{v}</Tag> },
    { title: '负责人', dataIndex: 'lead', width: 80 },
    { title: '状态', dataIndex: 'status', width: 90, render: v => { const [label, color] = statusMap[v] || [v, 'default']; return <Tag color={color}>{label}</Tag>; }},
    { title: '进度', width: 120, render: (_, r) => <span style={{ fontSize: 12 }}>{r.progress}%</span> },
    { title: '风险', dataIndex: 'risk', width: 80, render: v => <Tooltip title={`${v}风险`}><span style={{ color: v === 'high' ? '#ff4d4f' : v === 'medium' ? '#faad14' : '#52c41a' }}>{v === 'high' ? '高' : v === 'medium' ? '中' : '低'}</span></Tooltip> },
    { title: '合同额(万)', dataIndex: 'budget', width: 100, align: 'right', render: v => v?.toFixed(1) },
    { title: '已收款(万)', dataIndex: 'paid', width: 100, align: 'right', render: v => <Text style={{ color: '#52c41a' }}>{v?.toFixed(1)}</Text> },
    { title: '截止日期', dataIndex: 'end_date', width: 100 },
    { title: '操作', width: 100, render: (_, r) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} onClick={() => message.info(`查看 ${r.name} 详情`)} />
        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingProject(r); form.setFieldsValue(r); setModalOpen(true); }} />
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => { deleteProject(r.id); message.success('项目已删除'); }} />
      </Space>
    )}
  ]

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingProject) {
        await updateProject(editingProject.id, values)
        message.success('项目已更新')
      } else {
        await createProject({ ...values, description: values.description || '' })
        message.success('项目创建成功')
      }
      setModalOpen(false)
      form.resetFields()
    } catch (err) {
      message.error('请填写完整信息')
    }
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>项目管理</Title>
          <Text type="secondary">全流程项目跟踪管理</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>导出</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProject(null); form.resetFields(); setModalOpen(true); }}>新建项目</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '总项目数', value: stats.total, icon: '📁', color: '#1890ff' },
          { label: '进行中', value: stats.active, icon: '🔄', color: '#52c41a' },
          { label: '合同总额(万)', value: stats.totalBudget.toFixed(1), icon: '💰', color: '#faad14' },
          { label: '回款率', value: `${stats.totalBudget ? Math.round(stats.totalPaid / stats.totalBudget * 100) : 0}%`, icon: '📈', color: '#722ed1' },
          { label: '高风险项目', value: stats.highRisk, icon: '⚠️', color: '#ff4d4f' },
        ].map((s, i) => (
          <Col xs={12} sm={8} md={4.8} key={i}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{s.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Search placeholder="搜索项目名/客户/编号" style={{ width: 240 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }} options={[
            { value: 'all', label: '全部状态' }, { value: 'pending', label: '待开工' }, { value: 'active', label: '进行中' },
            { value: 'report', label: '报告编制' }, { value: 'completed', label: '已完成' }
          ]} />
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>AI智能排程</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1200 }} />
      </Card>

      <Modal title={editingProject ? '编辑项目' : '新建项目'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={640}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input placeholder="请输入项目名称" /></Form.Item></Col>
            <Col span={12}><Form.Item name="client" label="客户单位" rules={[{ required: true }]}><Input placeholder="请输入客户名称" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="type" label="检测类型"><Select options={['结构检测', '桥梁检测', '安全鉴定', '抗震鉴定', '钢结构检测', '环境检测', '地基检测', '材料检测'].map(v => ({ value: v, label: v }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="lead" label="项目负责人"><Select options={['李工', '王工', '赵工', '孙工', '周工', '吴工', '郑工'].map(v => ({ value: v, label: v }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="budget" label="合同额(万元)"><Input type="number" placeholder="0" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="start_date" label="开始日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="end_date" label="截止日期" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="项目描述"><Input.TextArea rows={3} placeholder="请输入项目描述..." /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
