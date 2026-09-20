import { useState } from 'react'
import {
  Row, Col, Card, List, Tag, Button, Space, Typography, Modal,
  Tabs, Badge, Timeline, Alert, message
} from 'antd'
import {
  SafetyOutlined, FileTextOutlined, BookOutlined, BellOutlined,
  RobotOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  ToolOutlined, ClockCircleOutlined, EnvironmentOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const regulations = [
  { id: 1, title: '建设工程质量检测管理办法', dept: '住建部', date: '2026-07-01', type: '部门规章', level: 'high', status: 'active', summary: '规范检测机构资质认定和检测行为，明确检测数据和报告的责任。' },
  { id: 2, title: '建筑结构检测技术标准', dept: '住建部', date: '2026-03-15', type: '国家标准', level: 'high', status: 'active', summary: '规定了建筑结构检测的基本原则、检测方法和评定标准。' },
  { id: 3, title: '房屋安全鉴定标准', dept: '住建部', date: '2026-01-01', type: '行业标准', level: 'medium', status: 'active', summary: '明确房屋安全鉴定的程序、内容和等级评定方法。' },
  { id: 4, title: '钢结构工程施工质量验收规范', dept: '住建部', date: '2025-12-01', type: '国家标准', level: 'high', status: 'update', summary: '最新修订版，增加了焊接质量检测要求。' },
  { id: 5, title: '室内环境污染物浓度限值', dept: '生态环境部', date: '2025-10-01', type: '国家标准', level: 'medium', status: 'active', summary: '规定了室内空气中有害物质限值及检测方法。' },
]

const complianceChecks = [
  { id: 1, name: '资质证书有效性检查', status: 'pass', date: '2026-09-15', detail: '所有资质证书均在有效期内' },
  { id: 2, name: '人员持证上岗检查', status: 'pass', date: '2026-09-10', detail: '在岗人员持证率100%' },
  { id: 3, name: '设备检定状态检查', status: 'warning', date: '2026-09-08', detail: '1台设备检定即将到期' },
  { id: 4, name: '检测报告规范性检查', status: 'pass', date: '2026-09-05', detail: '近期报告合格率98%' },
  { id: 5, name: '档案管理规范性检查', status: 'pending', date: '2026-09-20', detail: '待检查' },
]

export default function Compliance() {
  const [activeTab, setActiveTab] = useState('regulations')
  const [selectedReg, setSelectedReg] = useState(null)

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>合规风控</Title>
          <Text type="secondary">法规跟踪 · 合规检查 · 风险预警</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>
            AI合规审查
          </Button>
        </Space>
      </div>

      {/* 风险概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '法规总数', value: regulations.length, icon: '📋', color: '#1890ff', status: 'info' },
          { label: '待更新', value: 1, icon: '🔄', color: '#faad14', status: 'warning' },
          { label: '合规得分', value: '96', icon: '🎯', color: '#52c41a', status: 'success' },
          { label: '风险项', value: 1, icon: '⚠️', color: '#ff4d4f', status: 'error' },
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

      {/* Tab切换 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'regulations',
          label: '📚 法规库',
          children: (
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2 }}
              dataSource={regulations}
              renderItem={reg => (
                <List.Item>
                  <Card
                    hoverable
                    style={{ borderRadius: 12, height: '100%' }}
                    onClick={() => setSelectedReg(reg)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Space size={8}>
                        <Tag color={reg.level === 'high' ? 'red' : reg.level === 'medium' ? 'orange' : 'blue'}>
                          {reg.type}
                        </Tag>
                        {reg.status === 'update' && <Tag color="gold">已更新</Tag>}
                      </Space>
                      {reg.status === 'active' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                    </div>
                    <Title level={5} style={{ marginTop: 12, marginBottom: 8 }}>{reg.title}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>发布部门：{reg.dept} · 生效日期：{reg.date}</Text>
                    <ParagraphEllipsis text={reg.summary} />
                  </Card>
                </List.Item>
              )}
            />
          )
        },
        {
          key: 'checks',
          label: '✅ 合规检查',
          children: (
            <Card style={{ borderRadius: 12 }}>
              <List
                dataSource={complianceChecks}
                renderItem={item => (
                  <List.Item
                    style={{ padding: '16px 0' }}
                    extra={
                      item.status === 'pass' ? <Badge status="success" text="通过" /> :
                      item.status === 'warning' ? <Badge status="warning" text="注意" /> :
                      <Badge status="default" text="待检查" />
                    }
                  >
                    <List.Item.Meta
                      avatar={<SafetyOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />}
                      title={<Text strong>{item.name}</Text>}
                      description={
                        <Space direction="vertical" size={4}>
                          <Text type="secondary">{item.detail}</Text>
                          <Text style={{ fontSize: 12 }}>检查日期：{item.date}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <Button type="primary" block style={{ marginTop: 16 }}>开始新一轮合规检查</Button>
            </Card>
          )
        },
        {
          key: 'alerts',
          label: '⚠️ 风险预警',
          children: (
            <Alert
              type="warning"
              showIcon
              message="近期风险提醒"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>设备SB003检定即将到期(剩余11天)</li>
                  <li>《钢结构工程施工质量验收规范》有更新版本待采纳</li>
                  <li>建议开展Q3季度合规自查</li>
                </ul>
              }
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )
        }
      ]} />

      {/* 法规详情弹窗 */}
      <Modal
        title={<><FileTextOutlined /> 法规详情</>}
        open={!!selectedReg}
        onCancel={() => setSelectedReg(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedReg(null)}>关闭</Button>,
          <Button key="apply" type="primary">应用于当前业务</Button>
        ]}
        width={640}
      >
        {selectedReg && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><Text strong>法规名称：</Text><br />{selectedReg.title}</div>
              <div><Text strong>发布部门：</Text><br />{selectedReg.dept}</div>
              <div><Text strong>法规类型：</Text><br /><Tag>{selectedReg.type}</Tag></div>
              <div><Text strong>生效日期：</Text><br />{selectedReg.date}</div>
              <div><Text strong>变更说明：</Text><br />{selectedReg.status === 'update' ? '本次为修订版，主要变化见下方摘要' : '当前有效版本'}</div>
              <Divider />
              <div><Text strong>内容摘要：</Text></div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, lineHeight: 1.8 }}>
                {selectedReg.summary}
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ParagraphEllipsis({ text }) {
  return <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</Text>
}
