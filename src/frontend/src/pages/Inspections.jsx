import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, DatePicker, Progress, Typography, message
} from 'antd'
import {
  PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined,
  RobotOutlined, PrinterOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const statusMap = {
  pending: { label: '待检测', color: 'orange' },
  testing: { label: '检测中', color: 'blue' },
  reporting: { label: '报告编制', color: 'purple' },
  completed: { label: '已完成', color: 'green' }
}

export default function Inspections() {
  const { inspections: inspectionData, fetchInspections, createInspection } = useStore()
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedItem, setSelectedItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const filtered = inspectionData.filter(item => {
    const matchSearch = item.name?.includes(searchText) || item.id?.includes(searchText) || item.client?.includes(searchText)
    const matchType = filterType === 'all' || item.method === filterType
    const matchStatus = filterStatus === 'all' || item.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const completedCount = inspectionData.filter(i => i.status === 'completed').length
  const passedCount = inspectionData.filter(i => i.result === '合格').length
  const stats = {
    total: inspectionData.length,
    completed: completedCount,
    inProgress: inspectionData.filter(i => i.status === 'testing').length,
    pending: inspectionData.filter(i => i.status === 'pending').length,
    passRate: completedCount > 0 ? Math.round(passedCount / completedCount * 100) + '%' : '0%'
  }

  const columns = [
    { title: '检测编号', dataIndex: 'id', width: 120 },
    { title: '检测名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '所属项目', dataIndex: 'project_id', width: 130, render: v => <Text type="secondary">{v || '-'}</Text> },
    { title: '客户', dataIndex: 'client', width: 120, ellipsis: true },
    { title: '检测方法', dataIndex: 'method', width: 100, render: v => <Tag color="blue">{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
    { title: '进度', width: 100, render: (_, r) => <Progress percent={r.progress} size="small" status={r.progress === 100 ? 'success' : 'normal'} /> },
    { title: '检测员', dataIndex: 'examiner', width: 80 },
    { title: '检测结果', dataIndex: 'result', width: 80, render: v => v === '合格' ? <Tag color="green">合格</Tag> : v === '不合格' ? <Tag color="red">不合格</Tag> : <Text type="secondary">-</Text> },
    { title: '计划日期', dataIndex: 'plan_date', width: 100 },
    { title: '操作', width: 120, render: (_, r) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedItem(r)} />
        {r.status === 'testing' && <Button type="text" icon={<RobotOutlined />} title="AI辅助分析" />}
        {r.status === 'reporting' && <Button type="text" icon={<PrinterOutlined />} title="生成报告" />}
      </Space>
    )}
  ]

  const typeOptions = ['全部', '回弹法', '静载试验', '贯入法', '雷达法', '超声波检测', '气相色谱法', '拉拔试验', '焊接检测']

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await createInspection({ ...values, project_id: values.project })
      setModalOpen(false)
      form.resetFields()
      message.success('检测任务创建成功')
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>检测业务管理</Title>
          <Text type="secondary">检测任务全流程跟踪 | AI辅助质量控制</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>导出报告</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建检测任务</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '本月检测批次', value: stats.total, icon: '\U0001F52C', color: '#1890ff' },
          { label: '已完成', value: stats.completed, icon: '\u2705', color: '#52c41a' },
          { label: '进行中', value: stats.inProgress, icon: '\u23F3', color: '#faad14' },
          { label: '待执行', value: stats.pending, icon: '\u23F0', color: '#722ed1' },
          { label: '合格率', value: stats.passRate, icon: '\U0001F4CA', color: '#1890ff' },
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
          <Search placeholder="搜索检测名称/编号/客户" style={{ width: 240 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterType} onChange={setFilterType} style={{ width: 160 }} options={typeOptions.map(v => ({ value: v === '全部' ? 'all' : v, label: v }))} />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }} options={[
            { value: 'all', label: '全部状态' },
            { value: 'pending', label: '待检测' },
            { value: 'testing', label: '检测中' },
            { value: 'reporting', label: '报告编制' },
            { value: 'completed', label: '已完成' },
          ]} />
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>AI智能排程</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1200 }} loading={inspectionData.length === 0} />
      </Card>

      <Modal title={<Space><span>\U0001F52C</span><span>新建检测任务</span></Space>} open={modalOpen} onOk={handleSubmit} onCancel={() => { setModalOpen(false); form.resetFields() }} confirmLoading={submitting} width={640}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="检测名称" rules={[{ required: true, message: '请输入检测名称' }]}>
                <Input placeholder="请输入检测名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="project" label="所属项目" rules={[{ required: true }]}>
                <Select options={['XX大厦主体结构检测','YY桥梁荷载试验','ZZ小区房屋安全鉴定','AA学校抗震鉴定'].map(v => ({ value: v, label: v }))} placeholder="选择项目" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="method" label="检测方法" rules={[{ required: true }]}>
                <Select options={['回弹法','静载试验','贯入法','雷达法','超声波检测','气相色谱法','拉拔试验','焊接检测'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="examiner" label="检测员" rules={[{ required: true }]}>
                <Select options={['李工','王工','赵工','孙工','周工','吴工','李明华','刘强'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="plan_date" label="计划日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="client" label="委托客户"><Input placeholder="请输入委托客户名称" /></Form.Item>
          <Form.Item name="description" label="检测要求"><Input.TextArea rows={3} placeholder="请输入检测要求和标准..." /></Form.Item>
        </Form>
      </Modal>

      <Modal title={<Space><span>\U0001F50D</span><span>检测详情</span></Space>} open={!!selectedItem} onCancel={() => setSelectedItem(null)} footer={null} width={640}>
        {selectedItem && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}><Text type="secondary">检测编号：</Text><br /><Text strong>{selectedItem.id}</Text></Col>
              <Col span={12}><Text type="secondary">检测名称：</Text><br /><Text strong>{selectedItem.name}</Text></Col>
              <Col span={12}><Text type="secondary">所属项目：</Text><br /><Text>{selectedItem.project_id || '-'}</Text></Col>
              <Col span={12}><Text type="secondary">委托客户：</Text><br /><Text>{selectedItem.client || '-'}</Text></Col>
              <Col span={12}><Text type="secondary">检测方法：</Text><br /><Text>{selectedItem.method}</Text></Col>
              <Col span={12}><Text type="secondary">检测员：</Text><br /><Text>{selectedItem.examiner}</Text></Col>
              <Col span={12}><Text type="secondary">计划日期：</Text><br /><Text>{selectedItem.plan_date}</Text></Col>
              <Col span={12}><Text type="secondary">检测结果：</Text><br /><Text style={{ color: selectedItem.result === '合格' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>{selectedItem.result}</Text></Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text strong>当前进度</Text>
              <Progress percent={selectedItem.progress} status={selectedItem.progress === 100 ? 'success' : 'normal'} style={{ marginTop: 8 }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
