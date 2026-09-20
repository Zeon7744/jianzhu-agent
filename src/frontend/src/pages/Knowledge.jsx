import { useState } from 'react'
import {
  Row, Col, Card, List, Tag, Button, Space, Typography, Modal,
  Input, Tabs, Badge, message
} from 'antd'
import {
  BookOutlined, SearchOutlined, FolderOutlined, FileTextOutlined,
  RobotOutlined, StarOutlined, ThunderboltOutlined, PlusOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Search } = Input

const knowledgeBase = [
  { id: 1, title: '建筑工程质量检测操作规程', category: '检测标准', tags: ['标准', '规程'], hits: 1250, updated: '2026-09-01', author: '技术部' },
  { id: 2, title: '混凝土结构施工质量验收规范', category: '国家规范', tags: ['国标', '混凝土'], hits: 980, updated: '2026-08-15', author: '规范组' },
  { id: 3, title: '钢结构检测技术标准', category: '行业标准', tags: ['行标', '钢结构'], hits: 756, updated: '2026-07-20', author: '技术部' },
  { id: 4, title: '地基基础检测技术规范', category: '行业标准', tags: ['行标', '地基'], hits: 623, updated: '2026-06-10', author: '技术部' },
  { id: 5, title: '室内环境污染物检测指南', category: '操作指南', tags: ['指南', '环境'], hits: 542, updated: '2026-09-10', author: '环保组' },
  { id: 6, title: '检测报告编制规范', category: '质量管理', tags: ['报告', '质量'], hits: 890, updated: '2026-08-01', author: '质量部' },
  { id: 7, title: '设备使用维护手册合集', category: '设备手册', tags: ['设备', '手册'], hits: 445, updated: '2026-07-01', author: '设备组' },
  { id: 8, title: '典型案例分析库', category: '案例库', tags: ['案例', '分析'], hits: 678, updated: '2026-09-15', author: '技术部' },
]

const categories = ['全部', '检测标准', '国家规范', '行业标准', '操作指南', '质量管理', '设备手册', '案例库']

export default function Knowledge() {
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('全部')
  const [selectedDoc, setSelectedDoc] = useState(null)

  const filtered = knowledgeBase.filter(k => {
    const matchSearch = k.title.includes(searchText) || k.tags.some(t => t.includes(searchText))
    const matchCat = filterCategory === '全部' || k.category === filterCategory
    return matchSearch && matchCat
  })

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>知识管理</Title>
          <Text type="secondary">制度文档 · 标准规范 · 案例库 · 智能问答</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>
            AI知识库助手
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>上传文档</Button>
        </Space>
      </div>

      {/* 统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '知识文档', value: knowledgeBase.length, icon: '📄', color: '#1890ff' },
          { label: '分类目录', value: categories.length - 1, icon: '📂', color: '#52c41a' },
          { label: '总浏览次数', value: '7,164', icon: '👁️', color: '#faad14' },
          { label: '最近更新', value: '2天前', icon: '🔄', color: '#722ed1' },
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

      {/* 搜索和筛选 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="搜索文档名称、标签..."
            size="large"
            style={{ maxWidth: 400 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onSearch={setSearchText}
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          />
          <Space wrap>
            {categories.map(cat => (
              <Tag
                key={cat}
                color={filterCategory === cat ? 'blue' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 20 }}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </Tag>
            ))}
          </Space>
        </Space>
      </Card>

      {/* 知识列表 */}
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 2 }}
            dataSource={filtered}
            renderItem={doc => (
              <List.Item>
                <Card
                  hoverable
                  style={{ borderRadius: 12, height: '100%', cursor: 'pointer' }}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <FolderOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <Tag color="blue">{doc.category}</Tag>
                  </div>
                  <Title level={5} style={{ marginTop: 8, marginBottom: 8, fontSize: 14 }}>{doc.title}</Title>
                  <Space size={4} wrap style={{ marginBottom: 8 }}>
                    {doc.tags.map(tag => <Tag key={tag} style={{ fontSize: 11 }}>{tag}</Tag>)}
                  </Space>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c8c8c' }}>
                    <span><BookOutlined /> {doc.hits} 次浏览</span>
                    <span>更新: {doc.updated}</span>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Col>

        <Col span={6}>
          <Card title="🤖 AI知识助手" style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
            <div style={{ padding: 16, background: '#f6f8fa', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div style={{ marginTop: 8, fontSize: 13, color: '#595959' }}>问我任何业务问题</div>
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>快捷问题：</div>
            {['混凝土强度评定标准？', '检测报告编制要求？', '设备检定周期？', '资质证书有效期？'].map(q => (
              <div
                key={q}
                style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 6, marginBottom: 6, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e6f7ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fafafa' }}
              >
                {q}
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 文档详情弹窗 */}
      <Modal
        title={<><FileTextOutlined /> {selectedDoc?.title}</>}
        open={!!selectedDoc}
        onCancel={() => setSelectedDoc(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedDoc(null)}>关闭</Button>,
          <Button key="download" icon={<BookOutlined />}>下载原文</Button>,
          <Button key="qa" type="primary" icon={<RobotOutlined />}>AI解读</Button>
        ]}
        width={720}
      >
        {selectedDoc && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Tag color="blue">{selectedDoc.category}</Tag>
                {selectedDoc.tags.map(t => <Tag key={t}>{t}</Tag>)}
              </Space>
              <div><Text type="secondary">作者：{selectedDoc.author} · 更新日期：{selectedDoc.updated} · 浏览：{selectedDoc.hits}</Text></div>
              <Divider />
              <div style={{ padding: 20, background: '#f9f9f9', borderRadius: 8, minHeight: 200, textAlign: 'center', color: '#8c8c8c' }}>
                <BookOutlined style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                <div>文档预览区域</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>完整文档请下载后查看</div>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}
