import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Badge, Statistic, Alert } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, RobotOutlined, SafetyOutlined, ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'
const { Title, Text } = Typography

export default function Compliance() {
  const { projects, fetchProjects, inspections, fetchInspections, equipment, fetchEquipment } = useStore()
  const [qcData, setQcData] = useState([])
  const [safetyData, setSafetyData] = useState([])
  const [budgetData, setBudgetData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects(); fetchInspections(); fetchEquipment()
    Promise.all([
      fetch('http://localhost:8000/api/quality-checks').then(r => r.json()).then(d => setQcData(d || [])).catch(() => setQcData([])),
      fetch('http://localhost:8000/api/safety-records').then(r => r.json()).then(d => setSafetyData(d || [])).catch(() => setSafetyData([])),
      fetch('http://localhost:8000/api/budget-items').then(r => r.json()).then(d => setBudgetData(d || [])).catch(() => setBudgetData([])),
    ]).finally(() => setLoading(false))
  }, [])

  const qcTotal = qcData.length
  const qcPass = qcData.filter(q => q.result === '合格').length
  const qcFail = qcData.filter(q => q.result === '不合格').length
  const qcPending = qcData.filter(q => q.result === '待检').length
  const safetyOpen = safetyData.filter(s => s.status === 'open').length
  const safetyResolved = safetyData.filter(s => s.status === 'resolved').length
  const budgetTotal = budgetData.reduce((s, b) => s + (b.budget || 0), 0)
  const budgetActual = budgetData.reduce((s, b) => s + (b.actual || 0), 0)

  const qcOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['45%', '75%'],
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: qcPass, name: '合格', itemStyle: { color: '#52c41a' } },
        { value: qcFail, name: '不合格', itemStyle: { color: '#ff4d4f' } },
        { value: qcPending, name: '待检', itemStyle: { color: '#faad14' } },
      ]
    }]
  }

  const safetyOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['高风险', '中风险', '低风险'], bottom: 0 },
    grid: { top: 10, right: 20, bottom: 30, left: 40 },
    xAxis: { type: 'category', data: ['未处理', '已解决'], axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
    series: [
      { name: '高风险', type: 'bar', stack: 'total', data: [safetyData.filter(s=>s.level==='high'&&s.status==='open').length, safetyData.filter(s=>s.level==='high'&&s.status==='resolved').length], itemStyle: { color: '#ff4d4f' } },
      { name: '中风险', type: 'bar', stack: 'total', data: [safetyData.filter(s=>s.level==='medium'&&s.status==='open').length, safetyData.filter(s=>s.level==='medium'&&s.status==='resolved').length], itemStyle: { color: '#faad14' } },
      { name: '低风险', type: 'bar', stack: 'total', data: [safetyData.filter(s=>s.level==='low'&&s.status==='open').length, safetyData.filter(s=>s.level==='low'&&s.status==='resolved').length], itemStyle: { color: '#52c41a' } },
    ]
  }

  const qcColumns = [
    { title: '编号', dataIndex: 'id', width: 110 },
    { title: '项目', dataIndex: 'project_id', width: 100 },
    { title: '检验类型', dataIndex: 'check_type', width: 100 },
    { title: '检验项目', dataIndex: 'check_item', ellipsis: true },
    { title: '执行标准', dataIndex: 'standard', width: 160, render: v => <Text code style={{ fontSize: 11 }}>{v}</Text> },
    { title: '结果', dataIndex: 'result', width: 80, render: v => <Badge status={v==='合格'?'success':v==='不合格'?'error':'processing'} text={v} /> },
    { title: '检验员', dataIndex: 'inspector', width: 80 },
    { title: '计划日期', dataIndex: 'plan_date', width: 100 },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={v==='completed'?'green':v==='pending'?'orange':'blue'}>{v==='completed'?'已完成':v==='pending'?'待检':'进行中'}</Tag> },
  ]

  const safetyColumns = [
    { title: '编号', dataIndex: 'id', width: 100 },
    { title: '项目', dataIndex: 'project_id', width: 100 },
    { title: '隐患类型', dataIndex: 'hazard_type', width: 100 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '级别', dataIndex: 'level', width: 70, render: v => <Tag color={v==='high'?'red':v==='medium'?'orange':'green'}>{v==='high'?'高':v==='medium'?'中':'低'}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Badge status={v==='open'?'warning':'success'} text={v==='open'?'未处理':'已解决'} /> },
    { title: '责任人', dataIndex: 'assigned_to', width: 80 },
    { title: '截止日期', dataIndex: 'deadline', width: 100 },
    { title: '处理措施', dataIndex: 'resolution', ellipsis: true, render: v => v ? <Text style={{ color: '#52c41a' }}>{v}</Text> : <Text type="secondary">-</Text> },
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>合规与质安管理中心</Title>
        <Text type="secondary">质量检测 · 安全管理 · 预算管控 · 法规合规</Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '质检记录', sub: `合格率 ${(qcPass/qcTotal*100).toFixed(0)}%`, value: qcTotal, color: '#1890ff', icon: <CheckCircleOutlined /> },
          { label: '安全隐患', sub: `${safetyOpen}项待处理`, value: safetyOpen, color: safetyOpen > 0 ? '#ff4d4f' : '#52c41a', icon: <SafetyOutlined /> },
          { label: '预算执行率', sub: `${(budgetActual/budgetTotal*100).toFixed(1)}%`, value: `${(budgetActual/10000).toFixed(1)}万`, color: '#722ed1', icon: <BarChartOutlined /> },
          { label: '设备检定预警', sub: '即将到期需关注', value: (equipment||[]).filter(e=>e.status==='warning').length, color: '#fa8c16', icon: <ExclamationCircleOutlined /> },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{s.sub}</Text>
                </div>
                <div style={{ fontSize: 24, color: s.color, opacity: 0.5 }}>{s.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Left: Quality checks */}
        <Col xs={24} lg={14}>
          <Card title={<><CheckCircleOutlined /> 质量检测记录</>} style={{ borderRadius: 12, marginBottom: 16 }}>
            <Table
              dataSource={qcData}
              columns={qcColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 8 }}
              size="small"
              scroll={{ x: 900 }}
            />
          </Card>
          <Card title={<><BarChartOutlined /> 质检统计</>} style={{ borderRadius: 12 }}>
            <ReactECharts option={qcOption} style={{ height: 200 }} />
          </Card>
        </Col>

        {/* Right: Safety */}
        <Col xs={24} lg={10}>
          <Card title={<><SafetyOutlined /> 安全隐患管理</>} style={{ borderRadius: 12, marginBottom: 16 }}>
            {safetyData.map(s => (
              <div key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Tag color={s.level === 'high' ? 'red' : s.level === 'medium' ? 'orange' : 'green'} style={{ fontSize: 10 }}>
                      {s.level === 'high' ? '高' : s.level === 'medium' ? '中' : '低'}
                    </Tag>
                    <Text strong style={{ fontSize: 13 }}>{s.hazard_type}</Text>
                  </Space>
                  <Badge status={s.status === 'open' ? 'warning' : 'success'} text={s.status === 'open' ? '未处理' : '已解决'} />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{s.description?.substring(0, 30)}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 11 }}>责任人: {s.assigned_to}</Text>
                  <Text style={{ fontSize: 11, color: s.deadline && new Date(s.deadline) < new Date() ? '#ff4d4f' : '#8c8c8c' }}>
                    {s.deadline ? `截止: ${s.deadline}` : ''}
                  </Text>
                </div>
              </div>
            ))}
            {safetyData.length === 0 && <Text type="secondary">暂无安全记录</Text>}
          </Card>

          <Card title={<><BarChartOutlined /> 隐患分布</>} style={{ borderRadius: 12 }}>
            <ReactECharts option={safetyOption} style={{ height: 200 }} />
          </Card>
        </Col>
      </Row>

      {/* AI Quality Analysis */}
      <Card title={<><RobotOutlined /> AI质安分析助手</>} style={{ borderRadius: 12, marginTop: 16 }}>
        <Alert
          message="智能质检分析"
          description={
            <div>
              <p>当前系统共监测 <Text strong>{qcTotal}</Text> 项质检记录，合格率 <Text strong style={{ color: '#52c41a' }}>{(qcPass/qcTotal*100).toFixed(0)}%</Text>。</p>
              <p>存在 <Text strong style={{ color: '#ff4d4f' }}>{safetyOpen}</Text> 项未处理安全隐患，其中高风险 <Text strong style={{ color: '#ff4d4f' }}>{safetyData.filter(s=>s.level==='high'&&s.status==='open').length}</Text> 项，建议优先处理。</p>
              <p>预算执行率 <Text strong>{(budgetActual/budgetTotal*100).toFixed(1)}%</Text>，处于可控范围。</p>
            </div>
          }
          type={safetyOpen > 0 ? 'warning' : 'success'}
          showIcon
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  )
}
