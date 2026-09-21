import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Typography, Modal, Form, Input, InputNumber, Select, message, Statistic, Progress } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, DollarOutlined, BarChartOutlined, AlertOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'
const { Title, Text } = Typography

export default function Budget() {
  const { fetchProjects } = useStore()
  const [budgetItems, setBudgetItems] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    Promise.all([
      fetchProjects(),
      fetch('http://localhost:8000/api/budget-items').then(r => r.json()).then(d => setBudgetItems(d || [])).catch(() => setBudgetItems([])),
    ]).finally(() => setLoading(false))
  }, [])

  const totalBudget = budgetItems.reduce((s, b) => s + (b.budget || 0), 0)
  const totalActual = budgetItems.reduce((s, b) => s + (b.actual || 0), 0)
  const budgetRemaining = totalBudget - totalActual
  const budgetRate = totalBudget > 0 ? (totalActual / totalBudget * 100).toFixed(1) : 0
  const overBudgetItems = budgetItems.filter(b => b.actual > b.budget && b.budget > 0)

  const projectGroups = {}
  budgetItems.forEach(b => {
    if (!projectGroups[b.project_id]) projectGroups[b.project_id] = { budget: 0, actual: 0, items: [] }
    projectGroups[b.project_id].budget += b.budget || 0
    projectGroups[b.project_id].actual += b.actual || 0
    projectGroups[b.project_id].items.push(b)
  })

  const budgetOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['预算', '实际支出'], bottom: 0 },
    grid: { top: 20, right: 20, bottom: 50, left: 80 },
    xAxis: { type: 'category', data: Object.keys(projectGroups).map(id => id) },
    yAxis: { type: 'value', axisLabel: { formatter: v => (v/10000).toFixed(0) + '万' } },
    series: [
      { name: '预算', type: 'bar', data: Object.values(projectGroups).map(g => (g.budget/10000).toFixed(1)), itemStyle: { color: '#1890ff' } },
      { name: '实际支出', type: 'bar', data: Object.values(projectGroups).map(g => (g.actual/10000).toFixed(1)), itemStyle: { color: '#52c41a' } },
    ]
  }

  const overBudgetOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      label: { show: true, formatter: '{b}\n{c}万 ({d}%)' },
      data: Object.values(projectGroups).slice(0, 6).map((g, i) => ({
        value: ((g.actual - g.budget) / 10000).toFixed(2),
        name: i < Object.keys(projectGroups).length ? Object.keys(projectGroups)[i] : '',
        itemStyle: { color: g.actual > g.budget ? '#ff4d4f' : '#52c41a' }
      })).filter(d => d.value > 0)
    }]
  }

  const columns = [
    { title: '项目编号', dataIndex: 'project_id', width: 110 },
    { title: '类别', dataIndex: 'category', width: 90 },
    { title: '项目/内容', dataIndex: 'item', ellipsis: true },
    { title: '预算(万元)', dataIndex: 'budget', width: 100, render: v => <Text>{(v/10000).toFixed(2)}</Text> },
    { title: '实际(万元)', dataIndex: 'actual', width: 100, render: v => <Text strong style={{ color: v > (budgetItems.find(b=>b.id===undefined)?.budget||0) ? '#ff4d4f' : '#52c41a' }}>{(v/10000).toFixed(2)}</Text> },
    { title: '数量', dataIndex: 'quantity', width: 70 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '执行率', width: 100, render: (_, record) => (
      <Progress percent={record.budget > 0 ? Math.round(record.actual / record.budget * 100) : 0}
        size="small" status={record.actual > record.budget ? 'exception' : 'normal'} />
    )},
    { title: '操作', width: 120, render: (_, record) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} onClick={() => handleEdit(record)} />
        <Button size="small" type="link" danger onClick={() => handleDelete(record.id)}>
          <DeleteOutlined />
        </Button>
      </Space>
    )},
  ]

  const projectColumns = [
    { title: '项目编号', dataIndex: 'project_id', width: 110 },
    { title: '预算(万元)', dataIndex: 'budget', width: 100, render: v => <Text strong>{(v/10000).toFixed(2)}</Text> },
    { title: '实际(万元)', dataIndex: 'actual', width: 100, render: v => <Text>{(v/10000).toFixed(2)}</Text> },
    { title: '结余(万元)', render: (_, record) => {
      const r = record.budget - record.actual
      return <Text style={{ color: r >= 0 ? '#52c41a' : '#ff4d4f' }}>{r>=0?'+':''}{(r/10000).toFixed(2)}</Text>
    }},
    { title: '执行率', width: 100, render: (_, record) => (
      <Progress percent={record.budget > 0 ? Math.round(record.actual / record.budget * 100) : 0}
        size="small" status={record.actual > record.budget ? 'exception' : 'normal'} />
    )},
  ]

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const url = editingItem ? `http://localhost:8000/api/budget-items/${editingItem.id}` : 'http://localhost:8000/api/budget-items'
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, id: editingItem?.id })
      })
      if (res.ok) {
        message.success(editingItem ? '更新成功' : '创建成功')
        setModalVisible(false)
        const newData = await (await fetch('http://localhost:8000/api/budget-items')).json()
        setBudgetItems(newData || [])
      }
    } catch { message.error('请填写完整信息') }
  }

  const handleDelete = async (id) => {
    await fetch(`http://localhost:8000/api/budget-items/${id}`, { method: 'DELETE' })
    setBudgetItems(prev => prev.filter(b => b.id !== id))
    message.success('已删除')
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总预算" value={totalBudget/10000} prefix={<DollarOutlined />} suffix="万元" precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="实际支出" value={totalActual/10000} prefix={<DollarOutlined />} suffix="万元" precision={2}
              valueStyle={{ color: totalActual > totalBudget ? '#ff4d4f' : '#389e0d' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="预算结余" value={budgetRemaining/10000} prefix={<DollarOutlined />} suffix="万元" precision={2}
              valueStyle={{ color: budgetRemaining >= 0 ? '#52c41a' : '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="超支项数" value={overBudgetItems.length} prefix={<AlertOutlined />}
              valueStyle={{ color: overBudgetItems.length > 0 ? '#ff4d4f' : '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card title="各项目预算执行对比" extra={<BarChartOutlined />}>
            <ReactECharts option={budgetOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="超支分布" extra={<AlertOutlined style={{ color: '#ff4d4f' }} />}>
            {overBudgetItems.length > 0
              ? <ReactECharts option={overBudgetOption} style={{ height: 280 }} />
              : <div style={{ textAlign: 'center', padding: '60px 0', color: '#52c41a' }}>
                  <AlertOutlined style={{ fontSize: 48 }} /><br />所有项目预算正常
                </div>
            }
          </Card>
        </Col>
      </Row>

      <Card title="预算明细"
        extra={
          <Space>
            <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>新增预算项</Button>
          </Space>
        }>
        <Table rowKey="id" columns={columns} dataSource={budgetItems} loading={loading}
          pagination={{ pageSize: 15 }} scroll={{ x: 900 }}
        />
      </Card>

      <Card title="项目预算汇总" style={{ marginTop: 16 }}>
        <Table rowKey="project_id" columns={projectColumns}
          dataSource={Object.entries(projectGroups).map(([pid, g]) => ({ project_id: pid, ...g }))}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal title={editingItem ? '编辑预算项' : '新增预算项'} open={modalVisible}
        onOk={handleSubmit} onCancel={() => setModalVisible(false)} width={560}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="project_id" label="项目编号" rules={[{ required: true }]}>
                <Input placeholder="如 XM2026001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="类别" rules={[{ required: true }]}>
                <Select options={[
                  { value: '人工费', label: '人工费' },
                  { value: '材料费', label: '材料费' },
                  { value: '设备费', label: '设备费' },
                  { value: '检测费', label: '检测费' },
                  { value: '差旅费', label: '差旅费' },
                  { value: '管理费', label: '管理费' },
                  { value: '其他', label: '其他' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="item" label="项目/内容" rules={[{ required: true }]}>
            <Input placeholder="预算项目描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="budget" label="预算金额(元)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="actual" label="实际支出(元)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quantity" label="数量">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="单位">
                <Input placeholder="元/项/个" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
