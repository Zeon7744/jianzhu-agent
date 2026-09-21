import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Space, Button, Divider, Input, List, Tag, Modal } from 'antd'
import { BookOutlined, RobotOutlined, FolderOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useStore } from '../store'

const { Title, Text } = Typography

const categories = ['全部', '检测标准', '国家标准', '行业标准', '操作指南', '质量管理', '设备手册', '案例库']

export default function Knowledge() {
  const { knowledge: knowledgeData, fetchKnowledge } = useStore()
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('全部')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKnowledge().finally(() => setLoading(false))
  }, [])

  const filtered = knowledgeData.filter(k => {
    const matchSearch = k.title?.includes(searchText) || (k.tags || []).some(t => t.includes(searchText))
    const matchCat = filterCategory === '全部' || k.category === filterCategory
    return matchSearch && matchCat
  })

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>知识管理</Title>
          <Text type="secondary">制度文档 | 标准规范 | 案例库 | 智能问答</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>AI知识库助手</Button>
          <Button type="primary" icon={<BookOutlined />}>上传文档</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '知识文档', value: knowledgeData.length, icon: '\U0001F4D1', color: '#1890ff' },
          { label: '分类目录', value: categories.length - 1, icon: '\U0001F4C1', color: '#52c41a' },
          { label: '总浏览次数', value: knowledgeData.reduce((s, k) => s + (k.hits || 0), 0).toLocaleString(), icon: '\U0001F50E\U0000FE0F', color: '#faad14' },
          { label: '最近更新', value: '今天', icon: '\U0001F501', color: '#722ed1' },
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

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Search placeholder="搜索文档名称、标签..." value={searchText} onChange={e => setSearchText(e.target.value)} onSearch={setSearchText} style={{ maxWidth: 400 }} />
          <Space wrap>
            {categories.map(cat => (
              <Tag key={cat} color={filterCategory === cat ? 'blue' : 'default'} style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 20 }} onClick={() => setFilterCategory(cat)}>{cat}</Tag>
            ))}
          </Space>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={18}>
          <List grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 2 }} dataSource={filtered} loading={loading} renderItem={doc => (
            <List.Item>
              <Card hoverable style={{ borderRadius: 12, height: '100%', cursor: 'pointer' }} onClick={() => setSelectedDoc(doc)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <FolderOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <Tag color="blue">{doc.category}</Tag>
                </div>
                <Title level={5} style={{ marginTop: 8, marginBottom: 8, fontSize: 14 }}>{doc.title}</Title>
                <Space size={4} wrap style={{ marginBottom: 8 }}>
                  {(doc.tags || []).map(tag => <Tag key={tag} style={{ fontSize: 11 }}>{tag}</Tag>)}
                </Space>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c8c8c' }}>
                  <span><BookOutlined /> {doc.hits} 次浏览</span>
                  <span>更新: {doc.updated}</span>
                </div>
              </Card>
            </List.Item>
          )} />
        </Col>

        <Col span={6}>
          <Card title={<><span>\U0001F916</span><span>AI知识助手</span></>} style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
            <div style={{ padding: 16, background: '#f6f8fa', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div style={{ marginTop: 8, fontSize: 13, color: '#595959' }}>问任何业务问题</div>
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>快捷问题：</div>
            {['混凝土强度评定标准？', '检测报告编制要求？', '设备检定周期？', '资质证书有效期？'].map(q => (
              <div key={q} style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 6, marginBottom: 6, cursor: 'pointer', fontSize: 12 }}
                onMouseEnter={e => e.currentTarget.style.background = '#e6f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#fafafa'}>{q}</div>
            ))}
          </Card>
        </Col>
      </Row>

      <Modal title={<><BookOutlined /> {selectedDoc?.title}</>} open={!!selectedDoc} onCancel={() => setSelectedDoc(null)} footer={[<Button key="close" onClick={() => setSelectedDoc(null)}>关闭</Button>, <Button key="qa" type="primary" icon={<RobotOutlined />}>AI解读</Button>]} width={720}>
        {selectedDoc && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap><Tag color="blue">{selectedDoc.category}</Tag>{(selectedDoc.tags || []).map(t => <Tag key={t}>{t}</Tag>)}</Space>
              <div><Text type="secondary">作者：{selectedDoc.author} | 更新日期：{selectedDoc.updated} | 浏览：{selectedDoc.hits}</Text></div>
              <Divider />
              <div style={{ padding: 20, background: '#f9f9f9', borderRadius: 8, minHeight: 200, lineHeight: 1.8 }}>{selectedDoc.content || '文档内容预览区域'}</div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}
