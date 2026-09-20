import { useState } from 'react'
import {
  Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form,
  Select, Statistic, Progress, Tooltip, Badge, Typography, message
} from 'antd'
import {
  PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, RobotOutlined, WarningOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, ToolOutlined, CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Search } = Input

const initialEquipment = [
  { id: 'SB001', name: '万能试验机', model: 'WE-1000', status: 'normal', location: '一楼实验室A', cert: '有效', certDue: '2027-03-15', lastMaint: '2026-08-01', nextMaint: '2026-11-01', value: 285000 },
  { id: 'SB002', name: '回弹仪', model: 'HJ-2250', status: 'normal', location: '检测设备组', cert: '有效', certDue: '2027-01-20', lastMaint: '2026-07-15', nextMaint: '2026-10-15', value: 3200 },
  { id: 'SB003', name: '钢筋扫描仪', model: 'CSS-2', status: 'warning', location: '现场检测组', cert: '即将到期', certDue: '2026-10-01', lastMaint: '2026-06-01', nextMaint: '2026-09-01', value: 45000 },
  { id: 'SB004', name: '混凝土雷达', model: 'GPR-4000', status: 'normal', location: '一楼实验室B', cert: '有效', certDue: '2027-06-30', lastMaint: '2026-09-01', nextMaint: '2026-12-01', value: 185000 },
  { id: 'SB005', name: '超声波检测仪', model: 'UT-2206', status: 'maintenance', location: '维修中', cert: '有效', certDue: '2027-02-28', lastMaint: '2026-09-15', nextMaint: '2027-03-15', value: 68000 },
  { id: 'SB006', name: '拉力试验机', model: 'CMT4204', status: 'normal', location: '二楼实验室', cert: '有效', certDue: '2027-04-15', lastMaint: '2026-08-15', nextMaint: '2026-11-15', value: 156000 },
  { id: 'SB007', name: '水准仪', model: 'DSZ2', status: 'normal', location: '测量组', cert: '有效', certDue: '2027-05-01', lastMaint: '2026-07-01', nextMaint: '2026-10-01', value: 28000 },
  { id: 'SB008', name: '全站仪', model: 'NTS-362R', status: 'borrowed', location: '外借中', cert: '有效', certDue: '2027-01-15', lastMaint: '2026-06-15', nextMaint: '2026-09-15', value: 95000 },
]

const statusMap = {
  normal: { label: '正常', color: 'green' },
  warning: { label: '需检定', color: 'orange' },
  maintenance: { label: '维修中', color: 'red' },
  borrowed: { label: '外借', color: 'blue' }
}

export default function Equipment() {
  const [equipment, setEquipment] = useState(initialEquipment)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const filtered = equipment.filter(e => {
    const matchSearch = e.name.includes(searchText) || e.id.includes(searchText)
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: equipment.length,
    normal: equipment.filter(e => e.status === 'normal').length,
    warning: equipment.filter(e => e.status === 'warning').length,
    totalValue: equipment.reduce((s, e) => s + e.value, 0) / 10000
  }

  const columns = [
    { title: '设备编号', dataIndex: 'id', width: 90 },
    { title: '设备名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '型号', dataIndex: 'model', width: 100 },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
    { title: '存放位置', dataIndex: 'location', width: 120 },
    { title: '检定状态', dataIndex: 'cert', width: 90, render: v => v === '有效' ? <Badge status="success" text="有效" /> : <Badge status="warning" text={v} /> },
    { title: '检定到期', dataIndex: 'certDue', width: 100, render: v => {
      const days = dayjs(v).diff(dayjs(), 'day')
      return <Tooltip title={`${days}天后到期`}><Text style={{ color: days < 30 ? '#ff4d4f' : '#52c41a' }}>{v}</Text></Tooltip>
    }},
    { title: '下次保养', dataIndex: 'nextMaint', width: 100 },
    { title: '原值(万)', dataIndex: 'value', width: 90, align: 'right', render: v => (v / 10000).toFixed(1) },
    { title: '操作', width: 100, render: (_, r) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} onClick={() => message.info(`查看 ${r.name} 详情`)} />
        <Button type="text" icon={<EditOutlined />} />
      </Space>
    )}
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>设备管理</Title>
          <Text type="secondary">设备台账 · 检定追踪 · 预测性维护</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>导出台账</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加设备</Button>
        </Space>
      </div>

      {/* 统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '设备总数', value: stats.total, icon: '🔧', color: '#1890ff' },
          { label: '正常可用', value: stats.normal, icon: '✅', color: '#52c41a' },
          { label: '需检定', value: stats.warning, icon: '⚠️', color: '#faad14' },
          { label: '设备总值(万)', value: stats.totalValue, icon: '💰', color: '#722ed1' },
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

      {/* 筛选 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          <Search placeholder="搜索设备名/编号" style={{ width: 200 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }} options={[
            { value: 'all', label: '全部状态' },
            { value: 'normal', label: '正常' },
            { value: 'warning', label: '需检定' },
            { value: 'maintenance', label: '维修中' },
            { value: 'borrowed', label: '外借' }
          ]} />
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>
            AI维护预测
          </Button>
        </Space>
      </Card>

      {/* 设备列表 */}
      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1100 }} />
      </Card>
    </div>
  )
}
