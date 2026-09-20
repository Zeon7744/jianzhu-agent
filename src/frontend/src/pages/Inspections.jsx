import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, DatePicker, Statistic, Progress, Tooltip, Badge, Typography, message, Steps
} from 'antd'
import {
  PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, RobotOutlined, PrinterOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'

const { Title, Text } = Typography
 const { Search } = Input

const initialInspections = [
  { id: 'JC2026001', name: 'XX大厦混凝土强度检测', project: 'XX大厦主体结构检测', client: 'XX地产集团', type: '回弹法', status: 'completed', progress: 100, date: '2026-09-15', examiner: '李工', result: '合格' },
  { id: 'JC2026002', name: 'YY桥梁承载力检测', project: 'YY桥梁荷载试验', client: '市交通局', type: '静载试验', status: 'testing', progress: 65, date: '2026-09-18', examiner: '王工', result: '-' },
  { id: 'JC2026003', name: 'ZZ小区砌体强度检测', project: 'ZZ小区房屋安全鉴定', client: 'ZZ街道办', type: '贯入法', status: 'pending', progress: 0, date: '2026-09-20', examiner: '赵工', result: '-' },
  { id: 'JC2026004', name: 'AA学校楼板厚度检测', project: 'AA学校抗震鉴定', client: '区教育局', type: '雷达法', status: 'reporting', progress: 80, date: '2026-09-12', examiner: '孙工', result: '-' },
  { id: 'JC2026005', name: 'BB厂房焊缝质量检测', project: 'BB厂房钢结构检测', client: 'BB制造业', type: '超声波检测', status: 'pending', progress: 0, date: '2026-10-20', examiner: '周工', result: '-' },
  { id: 'JC2026006', name: 'CC医院甲醛检测', project: 'CC医院室内环境检测', client: '市第一人民医院', type: '气相色谱法', status: 'completed', progress: 100, date: '2026-09-10', examiner: '吴工', result: '合格' },
]

const statusMap = {
  pending: { label: '待检测', color: 'orange' },
  testing: { label: '检测中', color: 'blue' },
  reporting: { label: '报告编制', color: 'purple' },
  completed: { label: '已完成', color: 'green' }
}

export default function Inspections() {
  const [inspections, setInspections] = useState(initialInspections)
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedItem, setSelectedItem] = useState(null)

  const filtered = inspections.filter(item => {
    const matchSearch = item.name.includes(searchText) || item.id.includes(searchText)
    const matchType = filterType === 'all' || item.type === filterType
    return matchSearch && matchType
  })

  const stats = {
    total: inspections.length,
    completed: inspections.filter(i => i.status === 'completed').length,
    inProgress: inspections.filter(i => i.status === 'testing').length,
    pending: inspections.filter(i => i.status === 'pending').length,
    passRate: '98.5%'
  }

  const columns = [
    { title: '检测编号', dataIndex: 'id', width: 120 },
    { title: '检测名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '所属项目', dataIndex: 'project', width: 150, ellipsis: true },
    { title: '客户', dataIndex: 'client', width: 120 },
    { title: '检测方法', dataIndex: 'type', width: 100, render: v => <Tag color="blue">{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
    { title: '进度', width: 100, render: (_, r) => <Progress percent={r.progress} size="small" /> },
    { title: '检测员', dataIndex: 'examiner', width: 80 },
    { title: '检测结果', dataIndex: 'result', width: 80, render: v => v === '合格' ? <Tag color="green">合格</Tag> : v === '不合格' ? <Tag color="red">不合格</Tag> : <Text type="secondary">-</Text> },
    { title: '计划日期', dataIndex: 'date', width: 100 },
    { title: '操作', width: 100, render: (_, r) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedItem(r)} />
        {r.status === 'testing' && <Button type="text" icon={<RobotOutlined />} title="AI辅助分析" />}
        {r.status === 'reporting' && <Button type="text" icon={<PrinterOutlined />} title="生成报告" />}
      </Space>
    )}
  ]

  const typeOptions = ['全部', '回弹法', '静载试验', '贯入法', '雷达法', '超声波检测', '气相色谱法', '拉力试验', '焊接检测']

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>检测业务管理</Title>
          <Text type="secondary">检测任务全流程跟踪 · AI辅助质量控制</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>导出报告</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建检测任务</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '本月检测批次', value: stats.total, icon: '🔬', color: '#1890ff' },
          { label: '已完成', value: stats.completed, icon: '✅', color: '#52c41a' },
          { label: '进行中', value: stats.inProgress, icon: '🔄', color: '#faad14' },
          { label: '待执行', value: stats.pending, icon: '⏳', color: '#722ed1' },
          { label: '合格率', value: stats.passRate, icon: '📊', color: '#1890ff' },
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

      {/* 筛选栏 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Search placeholder="搜索检测名称/编号" style={{ width: 200 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterType} onChange={setFilterType} style={{ width: 160 }} options={typeOptions.map(v => ({ value: v === '全部' ? 'all' : v, label: v }))} />
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>
            AI智能排程
          </Button>
        </Space>
      </Card>

      {/* 检测列表 */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新建检测任务 */}
      <Modal
        title={<Space><span>🔬</span><span>新建检测任务</span></Space>}
        open={modalOpen}
        onOk={async () => {
          try {
            const values = await form.validateFields()
            const newItem = {
              id: `JC${dayjs().format('YYYYMMDD')}${String(inspections.length + 1).padStart(3, '0')}`,
              ...values,
              status: 'pending',
              progress: 0,
              result: '-'
            }
            setInspections([newItem, ...inspections])
            setModalOpen(false)
            message.success('检测任务创建成功')
          } catch {}
        }}
        onCancel={() => setModalOpen(false)}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="检测名称" rules={[{ required: true }]}>
                <Input placeholder="请输入检测名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="project" label="所属项目" rules={[{ required: true }]}>
                <Select options={['XX大厦主体结构检测', 'YY桥梁荷载试验', 'ZZ小区房屋安全鉴定', 'AA学校抗震鉴定'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="检测方法" rules={[{ required: true }]}>
                <Select options={['回弹法', '静载试验', '贯入法', '雷达法', '超声波检测', '气相色谱法'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="examiner" label="检测员" rules={[{ required: true }]}>
                <Select options={['李工', '王工', '赵工', '孙工', '周工', '吴工'].map(v => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="date" label="计划日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="检测要求">
            <Input.TextArea rows={3} placeholder="请输入检测要求和标准..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 检测详情 */}
      <Modal
        title={<Space><span>📋</span><span>检测详情</span></Space>}
        open={!!selectedItem}
        onCancel={() => setSelectedItem(null)}
        footer={null}
        width={720}
      >
        {selectedItem && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}><Text type="secondary">检测编号：</Text><br /><Text strong>{selectedItem.id}</Text></Col>
              <Col span={12}><Text type="secondary">检测名称：</Text><br /><Text strong>{selectedItem.name}</Text></Col>
              <Col span={12}><Text type="secondary">所属项目：</Text><br /><Text>{selectedItem.project}</Text></Col>
              <Col span={12}><Text type="secondary">客户：</Text><br /><Text>{selectedItem.client}</Text></Col>
              <Col span={12}><Text type="secondary">检测方法：</Text><br /><Text>{selectedItem.type}</Text></Col>
              <Col span={12}><Text type="secondary">检测员：</Text><br /><Text>{selectedItem.examiner}</Text></Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text strong>当前阶段</Text>
              <Steps
                current={['pending', 'testing', 'reporting', 'completed'].indexOf(selectedItem.status)}
                items={[
                  { title: '待检测', description: '任务已分配' },
                  { title: '检测中', description: '现场数据采集' },
                  { title: '报告编制', description: '数据分析处理' },
                  { title: '已完成', description: '报告已归档' }
                ]}
              />
            </div>
            <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
              <Text>检测结果：{selectedItem.result}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
