import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, DatePicker, Statistic, Progress, Tooltip, Badge, Typography, message
} from 'antd'
import {
  PlusOutlined, SearchOutlined, FilterOutlined, DownloadOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, RobotOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Search } = Input

// 模拟项目数据
const initialProjects = [
  { id: 'XM2026001', name: 'XX大厦主体结构检测', client: 'XX地产集团', type: '结构检测', lead: '李工', status: 'active', progress: 75, risk: 'medium', start: '2026-08-01', end: '2026-10-15', budget: 85, paid: 51 },
  { id: 'XM2026002', name: 'YY桥梁荷载试验', client: '市交通局', type: '桥梁检测', lead: '王工', status: 'report', progress: 90, risk: 'low', start: '2026-07-15', end: '2026-09-30', budget: 120, paid: 120 },
  { id: 'XM2026003', name: 'ZZ小区房屋安全鉴定', client: 'ZZ街道办', type: '安全鉴定', lead: '赵工', status: 'active', progress: 45, risk: 'high', start: '2026-09-01', end: '2026-10-08', budget: 45, paid: 22.5 },
  { id: 'XM2026004', name: 'AA学校抗震鉴定', client: '区教育局', type: '抗震鉴定', lead: '孙工', status: 'completed', progress: 100, risk: 'low', start: '2026-06-01', end: '2026-09-10', budget: 68, paid: 68 },
  { id: 'XM2026005', name: 'BB厂房钢结构检测', client: 'BB制造业', type: '钢结构检测', lead: '周工', status: 'pending', progress: 0, risk: 'low', start: '2026-10-20', end: '2026-12-01', budget: 55, paid: 0 },
  { id: 'XM2026006', name: 'CC医院室内环境检测', client: '市第一人民医院', type: '环境检测', lead: '吴工', status: 'active', progress: 60, risk: 'medium', start: '2026-08-15', end: '2026-10-01', budget: 32, paid: 16 },
]

const statusMap = {
  pending: { label: '待开工', color: 'orange' },
  active: { label: '进行中', color: 'blue' },
  report: { label: '报告编制', color: 'purple' },
  completed: { label: '已完成', color: 'green' }
}

const riskMap = { low: '低', medium: '中', high: '高' }

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedProject, setSelectedProject] = useState(null)

  const filtered = projects.filter(p => {
    const matchSearch = p.name.includes(searchText) || p.client.includes(searchText) || p.id.includes(searchText)
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    totalPaid: projects.reduce((s, p) => s + p.paid, 0),
    highRisk: projects.filter(p => p.risk === 'high').length
  }

  const columns = [
    { title: '项目编号', dataIndex: 'id', width: 120, fixed: 'left' },
    { title: '项目名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '客户', dataIndex: 'client', width: 120 },
    { title: '类型', dataIndex: 'type', width: 100, render: v => <Tag>{v}</Tag> },
    { title: '负责人', dataIndex: 'lead', width: 80 },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
    { title: '进度', width: 120, render: (_, r) => <Progress percent={r.progress} size="small" status={r.progress === 100 ? 'success' : 'normal'} /> },
    { title: '风险', dataIndex: 'risk', width: 80, render: v => <Tooltip title={riskMap[v] + '风险'}><ExclamationCircleOutlined style={{ color: v === 'high' ? '#ff4d4f' : v === 'medium' ? '#faad14' : '#52c41a', fontSize: 16 }} /></Tooltip> },
    { title: '合同额(万)', dataIndex: 'budget', width: 90, align: 'right' },
    { title: '已收款(万)', dataIndex: 'paid', width: 90, align: 'right', render: v => <Text style={{ color: '#52c41a' }}>{v}</Text> },
    { title: '截止日期', dataIndex: 'end', width: 100 },
    { title: '操作', width: 120, fixed: 'right', render: (_, r) => (
      <Space size="small">
        <Tooltip title="查看"><Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedProject(r)} /></Tooltip>
        <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} /></Tooltip>
        <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
      </Space>
    )}
  ]

  const handleCreate = () => {
    form.resetFields()
    setSelectedProject(null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (selectedProject) {
        setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, ...values } : p))
        message.success('项目信息已更新')
      } else {
        const newProject = {
          id: `XM${dayjs().format('YYYYMMDD')}${String(projects.length + 1).padStart(3, '0')}`,
          ...values,
          status: 'pending',
          progress: 0,
          risk: 'low',
          budget: values.budget || 0,
          paid: 0,
          start: dayjs().format('YYYY-MM-DD'),
          end: values.deadline
        }
        setProjects([newProject, ...projects])
        message.success('新项目创建成功')
      }
      setModalOpen(false)
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建项目</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '总项目数', value: stats.total, icon: '📁', color: '#1890ff' },
          { label: '进行中', value: stats.active, icon: '🔄', color: '#52c41a' },
          { label: '合同总额(万)', value: stats.totalBudget, icon: '💰', color: '#faad14' },
          { label: '回款率', value: `${Math.round(stats.totalPaid / stats.totalBudget * 100)}%`, icon: '📈', color: '#722ed1' },
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

      {/* 筛选工具栏 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Search placeholder="搜索项目名/客户/编号" style={{ width: 240 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }} options={[
            { value: 'all', label: '全部状态' },
            { value: 'pending', label: '待开工' },
            { value: 'active', label: '进行中' },
            { value: 'report', label: '报告编制' },
            { value: 'completed', label: '已完成' }
          ]} />
          <Button icon={<FilterOutlined />}>高级筛选</Button>
        </Space>
      </Card>

      {/* 项目列表 */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新建/编辑项目弹窗 */}
      <Modal
        title={selectedProject ? '编辑项目' : '新建项目'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={640}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ type: '结构检测', risk: 'low' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="client" label="客户单位" rules={[{ required: true }]}>
                <Input placeholder="请输入客户名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="检测类型">
                <Select options={['结构检测', '桥梁检测', '安全鉴定', '抗震鉴定', '钢结构检测', '环境检测', '地基检测', '材料检测'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lead" label="项目负责人">
                <Select options={['李工', '王工', '赵工', '孙工', '周工', '吴工', '郑工'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="budget" label="合同额(万元)">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start" label="开始日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={3} placeholder="请输入项目描述..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 项目详情弹窗 */}
      <Modal
        title={<Space><span>📋</span><span>项目详情</span></Space>}
        open={!!selectedProject}
        onCancel={() => setSelectedProject(null)}
        footer={null}
        width={720}
      >
        {selectedProject && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}><Text type="secondary">项目编号：</Text><br /><Text strong>{selectedProject.id}</Text></Col>
              <Col span={12}><Text type="secondary">项目名称：</Text><br /><Text strong>{selectedProject.name}</Text></Col>
              <Col span={12}><Text type="secondary">客户单位：</Text><br /><Text>{selectedProject.client}</Text></Col>
              <Col span={12}><Text type="secondary">检测类型：</Text><br /><Text>{selectedProject.type}</Text></Col>
              <Col span={12}><Text type="secondary">项目负责人：</Text><br /><Text>{selectedProject.lead}</Text></Col>
              <Col span={12}><Text type="secondary">合同额：</Text><br /><Text style={{ color: '#1890ff', fontWeight: 600 }}>{selectedProject.budget}万元</Text></Col>
            </Row>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><Text strong>项目进度</Text>
                <Progress percent={selectedProject.progress} status={selectedProject.progress === 100 ? 'success' : 'normal'} style={{ marginTop: 8 }} />
              </div>
              <div><Text strong>项目阶段</Text>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  {['立项', '采样', '检测', '报告', '归档'].map((s, i) => (
                    <Badge key={s} status={selectedProject.progress >= (i + 1) * 20 ? 'success' : 'default'} text={s} />
                  ))}
                </div>
              </div>
              <div style={{ padding: 12, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                <Text type="warning">⚠️ 当前状态: {statusMap[selectedProject.status]?.label} | 风险等级: {riskMap[selectedProject.risk]}</Text>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}
