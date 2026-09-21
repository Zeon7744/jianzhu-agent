import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Modal, Form, Input, Select, DatePicker, message, Statistic } from 'antd'
import { PlusOutlined, RobotOutlined, BookOutlined, UserOutlined, TrophyOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'
const { Title, Text } = Typography

export default function Training() {
  const { token, staff, fetchStaff } = useStore()
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRecords()
    fetchStaff()
    loadStats()
  }, [])

  const loadRecords = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/training-records', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setRecords(data || [])
    } catch (e) { console.error(e) }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stats/training', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setStats(data)
    } catch (e) {}
  }

  const handleOpen = () => {
    form.resetFields()
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const vals = await form.validateFields()
    setSubmitting(true)
    try {
      await fetch('http://localhost:8000/api/training-records', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(vals)
      })
      message.success('培训记录创建成功')
      setModalOpen(false)
      loadRecords()
      loadStats()
    } catch (e) { message.error('操作失败') }
    finally { setSubmitting(false) }
  }

  const deptColors = { '技术部': 'blue', '检测部': 'green', '咨询部': 'purple', '安全部': 'orange', '质量部': 'cyan', '综合部': 'magenta', '财务部': 'red' }

  const chartData = stats?.by_dept
    ? Object.entries(stats.by_dept).map(([k, v]) => ({ name: k, value: v }))
    : [{ name: '暂无数据', value: 1 }]

  const columns = [
    { title: '编号', dataIndex: 'id', width: 90 },
    { title: '员工', width: 100, render: (_, r) => <Space><UserOutlined />{r.staff_name}</Space> },
    { title: '课程名称', dataIndex: 'course_name', ellipsis: true },
    { title: '培训机构', dataIndex: 'trainer', width: 120 },
    { title: '培训时间', width: 160, render: (_, r) => `${r.start_date} ~ ${r.end_date}` },
    { title: '学时', dataIndex: 'hours', width: 60, render: v => <Tag>{v}h</Tag> },
    { title: '结果', width: 80, render: v => v === '合格' ? <Tag color="green">合格</Tag> : <Tag>{v}</Tag> },
    { title: '获得证书', dataIndex: 'cert_obtained', width: 140, render: v => v ? <Tag color="blue" icon={<TrophyOutlined />}>{v}</Tag> : <Text type="secondary">-</Text> },
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>培训记录管理</Title>
          <Text type="secondary">员工培训档案、继续教育、专项技能培训管理</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpen}>记录培训</Button>
      </div>

      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="培训总记录" value={stats.total} suffix="条" valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="合格人数" value={stats.passed} suffix="人次" valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="合格率" value={stats.pass_rate} suffix="%" valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic title="覆盖部门" value={Object.keys(stats.by_dept || {}).length} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
            <Table dataSource={records} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} size="small" scroll={{ x: 1000 }} locale={{ emptyText: '暂无培训记录' }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<><BookOutlined /> 培训部门分布</>} style={{ borderRadius: 12, marginBottom: 16 }}>
            <ReactECharts option={{
              tooltip: { trigger: 'item' },
              series: [{ type: 'pie', radius: ['40%', '70%'], label: { fontSize: 11 }, data: chartData }]
            }} style={{ height: 200 }} />
          </Card>
          <Card title={<><RobotOutlined /> AI培训建议</>} style={{ borderRadius: 12 }}>
            <div style={{ lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#8c8c8c' }}>基于行业规范要求：</p>
              <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, lineHeight: 2 }}>
                <li>检测人员每年须完成不少于<span style={{ color: '#ff4d4f', fontWeight: 600 }}>60学时</span>继续教育</li>
                <li>新员工须完成不少于40学时的入职培训</li>
                <li>安全培训须每半年至少一次</li>
                <li>特殊岗位（无损检测等）须持证上岗</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal title="记录培训" open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} confirmLoading={submitting} width={600} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="staff_id" label="员工ID" rules={[{ required: true }]}>
                <Select options={(staff || []).filter(s => s.status === 'active').map(s => ({ value: s.id, label: `${s.name} (${s.id})` }))} placeholder="选择员工" showSearch filterOption={(inp, opt) => (opt?.label || '').toLowerCase().includes(inp.toLowerCase())} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="staff_name" label="员工姓名">
                <Input placeholder="自动关联" readOnly />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="course_name" label="课程名称" rules={[{ required: true }]}>
            <Input placeholder="如：无损检测II级培训" />
          </Form.Item>
          <Form.Item name="trainer" label="培训机构/讲师">
            <Input placeholder="如：中国无损检测学会" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label="开始日期">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="结束日期">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hours" label="学时" initialValue={40}>
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="result" label="考核结果" initialValue="合格">
                <Select options={[{ value: '合格', label: '合格' }, { value: '不合格', label: '不合格' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="cert_obtained" label="获得证书">
            <Input placeholder="如：无损检测II级证书" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
