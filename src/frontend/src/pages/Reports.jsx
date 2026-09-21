import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Typography, Badge, Progress } from 'antd'
import { PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined, FileDoneOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const STATUS_MAP = {
  draft: { label: '草稿', color: 'default' },
  testing: { label: '检测中', color: 'processing' },
  reporting: { label: '编制中', color: 'orange' },
  completed: { label: '已完成', color: 'green' },
}

export default function Reports() {
  const { user } = useStore()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetch('http://localhost:8000/api/reports')
      .then(r => r.json())
      .then(data => { setReports(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = reports.filter(rp => {
    const matchStatus = filterStatus === 'all' || rp.status === filterStatus
    const matchSearch = !searchText || rp.title?.includes(searchText) || rp.id?.includes(searchText)
    return matchStatus && matchSearch
  })

  const completedCount = reports.filter(r => r.status === 'completed').length
  const inProgressCount = reports.filter(r => ['testing', 'reporting'].includes(r.status)).length

  const columns = [
    { title: '报告编号', dataIndex: 'id', width: 130, render: v => <Text strong style={{ color: '#722ed1' }}>{v}</Text> },
    { title: '报告名称', dataIndex: 'title', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '报告号', dataIndex: 'report_no', width: 130 },
    { title: '检测类型', dataIndex: 'type', width: 100, render: v => <Tag color="purple">{v}</Tag> },
    { title: '关联检测', dataIndex: 'inspection_id', width: 120 },
    { title: '页数', dataIndex: 'pages', width: 60, render: v => v || '-' },
    { title: '签发日期', dataIndex: 'issue_date', width: 100, render: v => v || '-' },
    { title: '审核人', dataIndex: 'reviewer', width: 90 },
    { title: '密级', dataIndex: 'confidentiality', width: 80, render: v => <Tag color={v === 'confidential' ? 'red' : 'blue'}>{v === 'confidential' ? '机密' : '内部'}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => {
      const m = STATUS_MAP[v] || { label: v, color: 'default' }
      return <Badge status={m.color === 'green' ? 'success' : m.color === 'orange' ? 'warning' : m.color === 'processing' ? 'processing' : 'default'} text={m.label} />
    }},
    { title: '操作', width: 120, render: (_, r) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} size="small" title="查看报告" />
        {r.status !== 'completed' && user?.role !== 'guest' && <Button type="text" icon={<DownloadOutlined />} size="small" title="导出" />}
      </Space>
    )},
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>检测报告</Title>
          <Text type="secondary">报告编制 | 审核签发 | 归档管理</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>导出报表</Button>
          {user?.role !== 'guest' && <Button type="primary" icon={<PlusOutlined />}>新建报告</Button>}
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '报告总数', value: reports.length, icon: '\u{1F4C5}', color: '#1890ff' },
          { label: '已完成', value: completedCount, icon: '\u{2705}', color: '#52c41a' },
          { label: '进行中', value: inProgressCount, icon: '\u{1F50D}', color: '#faad14' },
          { label: '平均页数', value: (reports.reduce((s, r) => s + (r.pages || 0), 0) / Math.max(reports.length, 1)).toFixed(0), icon: '\u{1F4DD}', color: '#722ed1' },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Card style={{ borderRadius: 12 }}>
            <Space style={{ marginBottom: 16 }}>
              <Search placeholder="搜索报告名称/编号" style={{ width: 220 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }} options={[
                { value: 'all', label: '全部状态' },
                { value: 'completed', label: '已完成' },
                { value: 'reporting', label: '编制中' },
                { value: 'testing', label: '检测中' },
                { value: 'draft', label: '草稿' },
              ]} />
            </Space>
            <Table dataSource={filtered} columns={columns} rowKey="id" loading={loading}
              pagination={{ pageSize: 10, showTotal: t => `共 ${t} 份报告` }}
              scroll={{ x: 1100 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="报告状态分布" style={{ borderRadius: 12 }}>
            <ReactECharts option={{
              tooltip: { trigger: 'item' },
              series: [{
                type: 'pie', radius: ['40%', '70%'], center: ['50%', '55%'],
                data: [
                  { value: completedCount, name: '已完成', itemStyle: { color: '#52c41a' } },
                  { value: reports.filter(r => r.status === 'reporting').length, name: '编制中', itemStyle: { color: '#faad14' } },
                  { value: reports.filter(r => r.status === 'testing').length, name: '检测中', itemStyle: { color: '#1890ff' } },
                  { value: reports.filter(r => r.status === 'draft').length, name: '草稿', itemStyle: { color: '#d9d9d9' } },
                ],
                label: { show: true, formatter: '{b}: {c}' }
              }]
            }} style={{ height: 200 }} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>报告编号规则：RP+日期+序号</Text>
            </div>
          </Card>
          <Card title="近期签发" style={{ borderRadius: 12, marginTop: 16 }}>
            {reports.filter(r => r.status === 'completed').slice(0, 4).map(rp => (
              <div key={rp.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 13 }}>{rp.title}</Text>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{rp.report_no} · {rp.issue_date}</div>
                </div>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
