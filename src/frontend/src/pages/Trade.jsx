import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Typography, Badge, Rate, Tooltip } from 'antd'
import { PlusOutlined, SearchOutlined, ShoppingCartOutlined, TruckOutlined, ShopOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography
const { Search } = Input

const TYPE_COLORS = { '建材供应商': 'blue', '检测设备供应商': 'purple', '环保材料供应商': 'green', '五金机电供应商': 'orange', '安防设备供应商': 'red', '化工材料供应商': 'cyan', '装饰材料供应商': 'magenta', '仪器仪表供应商': 'geekblue' }

export default function Trade() {
  const { user } = useStore()
  const [suppliers, setSuppliers] = useState([])
  const [procurement, setProcurement] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('suppliers')

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/suppliers').then(r => r.json()),
      fetch('http://localhost:8000/api/procurement').then(r => r.json()),
    ]).then(([s, p]) => { setSuppliers(s); setProcurement(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = suppliers.filter(s => !searchText || s.name?.includes(searchText) || s.id?.includes(searchText))
  const totalSuppliers = suppliers.length
  const avgRating = suppliers.length > 0 ? (suppliers.reduce((s, sp) => s + (sp.rating || 0), 0) / suppliers.length).toFixed(1) : 0
  const pendingOrders = procurement.filter(po => po.status === 'pending').length
  const totalProcurement = procurement.reduce((s, po) => s + (po.amount || 0), 0) / 10000

  const supColumns = [
    { title: '编号', dataIndex: 'id', width: 90 },
    { title: '供应商名称', dataIndex: 'name', ellipsis: true, render: v => <Text strong>{v}</Text> },
    { title: '类型', dataIndex: 'type', width: 120, render: v => <Tag color={TYPE_COLORS[v] || 'default'}>{v}</Tag> },
    { title: '联系人', dataIndex: 'contact', width: 90 },
    { title: '电话', dataIndex: 'phone', width: 110 },
    { title: '评分', dataIndex: 'rating', width: 100, render: v => <Rate allowHalf disabled defaultValue={v} count={5} /> },
    { title: '主营产品', dataIndex: 'main_products', ellipsis: true, render: v => {
      const prods = typeof v === 'string' ? v.split(' ') : (Array.isArray(v) ? v : [])
      return <Tooltip title={prods.join(', ')}><Space size={4}>{prods.slice(0, 2).map(p => <Tag key={p} style={{ fontSize: 11 }}>{p}</Tag>)}</Space></Tooltip>
    }},
    { title: '状态', dataIndex: 'status', width: 80, render: v => <Badge status={v === 'active' ? 'success' : 'default'} text={v === 'active' ? '合作中' : '已停用'} /> },
  ]

  const poColumns = [
    { title: '采购单号', dataIndex: 'id', width: 130, render: v => <Text strong style={{ color: '#fa8c16' }}>{v}</Text> },
    { title: '材料', dataIndex: 'material_id', width: 100 },
    { title: '供应商', dataIndex: 'supplier_id', width: 90 },
    { title: '数量', dataIndex: 'quantity', width: 70 },
    { title: '单价(元)', dataIndex: 'unit_price', width: 90, render: v => v?.toFixed(0) },
    { title: '金额(元)', dataIndex: 'amount', width: 90, render: v => <Text strong>{v?.toLocaleString()}</Text> },
    { title: '下单日期', dataIndex: 'order_date', width: 100 },
    { title: '预计到货', dataIndex: 'expected_date', width: 100 },
    { title: '实际到货', dataIndex: 'actual_date', width: 100, render: v => v || <Text type="secondary">-</Text> },
    { title: '状态', dataIndex: 'status', width: 90, render: v => {
      const m = { pending: ['待发货', 'orange'], shipped: ['已发货', 'blue'], received: ['已到货', 'green'] }
      const [label, color] = m[v] || [v, 'default']
      return <Tag color={color}>{label}</Tag>
    }},
  ]

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>贸易管理</Title>
          <Text type="secondary">供应商管理 | 采购订单 | 库存管理</Text>
        </div>
        <Space>
          <Button icon={<ShoppingCartOutlined />}>采购报表</Button>
          {user?.role !== 'guest' && <Button type="primary" icon={<PlusOutlined />}>新建采购</Button>}
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '供应商总数', value: totalSuppliers, icon: '\u{1F3EC}', color: '#1890ff' },
          { label: '平均评分', value: avgRating, icon: '\u{2B50}', color: '#faad14' },
          { label: '待处理订单', value: pendingOrders, icon: '\u{1F4E6}', color: '#ff4d4f' },
          { label: '采购总额(万)', value: totalProcurement.toFixed(1), icon: '\u{1F4B0}', color: '#722ed1' },
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
          {['suppliers', 'procurement'].map(tab => (
            <Button key={tab} type={activeTab === tab ? 'primary' : 'default'}
              onClick={() => setActiveTab(tab)}
              style={{ borderRadius: 20 }}>
              {tab === 'suppliers' ? <><ShopOutlined /> 供应商 ({suppliers.length})</> : <><TruckOutlined /> 采购订单 ({procurement.length})</>}
            </Button>
          ))}
        </div>

        {activeTab === 'suppliers' ? (
          <>
            <Search placeholder="搜索供应商名称/编号" style={{ marginBottom: 16, width: 280 }} value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} />
            <Table dataSource={filtered} columns={supColumns} rowKey="id" loading={loading}
              pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
          </>
        ) : (
          <Table dataSource={procurement} columns={poColumns} rowKey="id" loading={loading}
            pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
        )}
      </Card>
    </div>
  )
}
