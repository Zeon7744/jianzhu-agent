import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Typography, Badge, Rate, Tooltip } from 'antd'
import { PlusOutlined, SearchOutlined, ShoppingCartOutlined, TruckOutlined, ShopOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const CAT_COLORS = {
  '建筑材料': 'blue',
  '检测设备供应商': 'purple',
  '环保材料供应商': 'green',
  '五金机电供应商': 'orange',
  '安防设备供应商': 'red',
  '化工材料供应商': 'cyan',
  '装饰材料供应商': 'magenta',
  '仪器仪表供应商': 'geekblue',
}

export default function Materials() {
  const { user, materials, fetchMaterials, procurement, fetchProcurement, suppliers, fetchSuppliers } = useStore()
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('suppliers')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    Promise.all([
      fetchMaterials(),
      fetchProcurement(),
      fetchSuppliers(),
    ]).finally(() => setLoading(false))
  }, [])

  const filtered = (activeTab === 'suppliers' ? suppliers : materials).filter(item =>
    !searchText || item.name?.includes(searchText) || item.id?.includes(searchText)
  )

  const totalSuppliers = suppliers.length
  const avgRating = suppliers.length > 0 ? (suppliers.reduce((s, sp) => s + (sp.rating || 0), 0) / suppliers.length).toFixed(1) : 0
  const pendingOrders = procurement.filter(po => po.status === 'pending').length
  const totalProcurement = procurement.reduce((s, po) => s + (po.amount || 0), 0) / 10000
  const lowStockCount = materials.filter(m => m.stock <= m.min_stock).length

  const supColumns = [
    { title: '编号', dataIndex: 'id', width: 90 },
    { title: '供应商名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '类型', dataIndex: 'type', width: 120, render: v => <Tag color={CAT_COLORS[v] || 'default'}>{v}</Tag> },
    { title: '联系人', dataIndex: 'contact', width: 90 },
    { title: '电话', dataIndex: 'phone', width: 110 },
    { title: '评分', dataIndex: 'rating', width: 100, render: v => <Rate allowHalf disabled defaultValue={v} count={5} /> },
    { title: '主营产品', dataIndex: 'main_products', ellipsis: true, render: v => {
      const prods = typeof v === 'string' ? v.split(' ') : (Array.isArray(v) ? v : [])
      return <Tooltip title={prods.join(', ')}><Space size={4}>{prods.slice(0, 2).map(p => <Tag key={p} style={{ fontSize: 11 }}>{p}</Tag>)}</Space></Tooltip>
    }},
    { title: '状态', dataIndex: 'status', width: 80, render: v => <Badge status={v === 'active' ? 'success' : 'default'} text={v === 'active' ? '合作中' : '已停用'} /> },
  ]

  const matColumns = [
    { title: '编号', dataIndex: 'id', width: 100 },
    { title: '材料名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '分类', dataIndex: 'category', width: 100, render: v => <Tag>{v}</Tag> },
    { title: '单价(元)', dataIndex: 'price', width: 90, render: v => v?.toFixed(0) },
    { title: '库存', dataIndex: 'stock', width: 70, render: v => <Text style={{ color: v <= (v._min || 0) ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
    { title: '最低库存', dataIndex: 'min_stock', width: 80 },
    { title: '状态', dataIndex: 'status', width: 80, render: v => <Badge status={v === 'normal' ? 'success' : 'warning'} text={v === 'normal' ? '正常' : '预警'} /> },
  ]

  const poColumns = [
    { title: '采购单号', dataIndex: 'id', width: 130, render: v => <Text strong style={{ color: '#fa8c16' }}>{v}</Text> },
    { title: '材料', dataIndex: 'material_id', width: 100 },
    { title: '供应商', dataIndex: 'supplier_id', width: 90 },
    { title: '数量', dataIndex: 'quantity', width: 70 },
    { title: '单价(元)', dataIndex: 'unit_price', width: 90, render: v => v?.toFixed(0) },
    { title: '金额(元)', dataIndex: 'amount', width: 100, render: v => <Text strong>{v?.toLocaleString()}</Text> },
    { title: '下单日期', dataIndex: 'order_date', width: 100 },
    { title: '预计到货', dataIndex: 'expected_date', width: 100 },
    { title: '实际到货', dataIndex: 'actual_date', width: 100, render: v => v || <Text type="secondary">-</Text> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => {
      const m = { pending: ['待发货', 'orange'], shipped: ['已发货', 'blue'], received: ['已到库', 'green'] }
      const [label, color] = m[v] || [v, 'default']
      return <Tag color={color}>{label}</Tag>
    }},
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>材料管理</Title>
          <Text type="secondary">供应商管理 | 采购订单 | 库存监控</Text>
        </div>
        <Space>
          <Button icon={<ShoppingCartOutlined />}>采购报表</Button>
          {user?.role !== 'guest' && <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建采购</Button>}
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '供应商总数', value: totalSuppliers, icon: '\u{1F3EC}', color: '#1890ff' },
          { label: '平均评分', value: avgRating, icon: '\u{2B50}', color: '#faad14' },
          { label: '待处理订单', value: pendingOrders, icon: '\u{1F4E6}', color: '#ff4d4f' },
          { label: '库存预警', value: lowStockCount, icon: '\u{1F6A8}', color: '#fa8c16' },
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

      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          {['suppliers', 'materials', 'procurement'].map(tab => (
            <Button key={tab} type={activeTab === tab ? 'primary' : 'default'}
              onClick={() => setActiveTab(tab)}
              style={{ borderRadius: 20 }}>
              {tab === 'suppliers' ? <><ShopOutlined /> 供应商 ({suppliers.length})</> :
               tab === 'materials' ? <><WarehouseOutlined /> 材料 ({materials.length})</> :
               <><TruckOutlined /> 采购订单 ({procurement.length})</>}
            </Button>
          ))}
        </div>

        <Search placeholder="搜索名称/编号" style={{ marginBottom: 16, width: 280 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />

        {activeTab === 'suppliers' ? (
          <Table dataSource={filtered} columns={supColumns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
        ) : activeTab === 'materials' ? (
          <Table
            dataSource={filtered.map(m => ({ ...m, _min: m.min_stock }))}
            columns={matColumns} rowKey="id" loading={loading}
            pagination={{ pageSize: 10 }} scroll={{ x: 700 }}
          />
        ) : (
          <Table dataSource={procurement} columns={poColumns} rowKey="id" loading={loading}
            pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
        )}
      </Card>

      <Modal title="新建采购申请" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="material_id" label="材料" rules={[{ required: true }]}>
            <Select placeholder="选择材料">
              {materials.map(m => <Select.Option key={m.id} value={m.id}>{m.name} ({m.id})</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="supplier_id" label="供应商" rules={[{ required: true }]}>
            <Select placeholder="选择供应商">
              {suppliers.filter(s => s.status === 'active').map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
                <Input type="number" min={1} placeholder="输入数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit_price" label="单价(元)">
                <Input type="number" min={0} placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expected_date" label="预计到货日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block onClick={() => { form.resetFields(); setModalOpen(false) }}>提交申请</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
