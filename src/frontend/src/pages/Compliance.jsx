import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Alert, Space, Button, Divider, Progress, List } from 'antd'
import { SafetyOutlined, CheckCircleOutlined, ExclamationCircleOutlined, BookOutlined, RobotOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useStore } from '../store'

const { Title, Text } = Typography

const regulations = [
  { id: 1, title: '建设工程质量检测管理办法', dept: '住建部', date: '2026-07-01', type: '部门规章', level: 'high', summary: '规范检测机构资质认定和检测行为，明确检测数据和报告的责任。' },
  { id: 2, title: '建筑结构检测技术标准', dept: '住建部', date: '2026-03-15', type: '国家标准', level: 'high', summary: '规定了建筑结构检测的基本原则、检测方法和评定标准。' },
  { id: 3, title: '房屋安全鉴定标准', dept: '住建部', date: '2026-01-01', type: '行业标准', level: 'medium', summary: '明确房屋安全鉴定的程序、内容和等级评定方法。' },
  { id: 4, title: '钢结构工程施工质量验收规范', dept: '住建部', date: '2025-12-01', type: '国家标准', level: 'high', summary: '最新修订版，增加了焊接质量检测要求。' },
  { id: 5, title: '室内环境污染物浓度限值', dept: '生态环境部', date: '2025-10-01', type: '国家标准', level: 'medium', summary: '规定了室内空气中有害物质限值及检测方法。' },
]

const complianceChecks = [
  { id: 1, name: '资质证书有效性检查', status: 'pass', date: '2026-09-15', detail: '所有资质证书均在有效期内' },
  { id: 2, name: '人员持证上岗检查', status: 'pass', date: '2026-09-10', detail: `在岗${staff?.length || 0}人全部持证` },
  { id: 3, name: '设备检定状态检查', status: equipment?.some(e => e.status === 'warning') ? 'warning' : 'pass', date: '2026-09-08', detail: `${equipment?.filter(e => e.status === 'warning').length || 0}台设备检定即将到期` },
  { id: 4, name: '检测报告规范性检查', status: 'pass', date: '2026-09-05', detail: '近期报告合格率98%' },
  { id: 5, name: '法规更新跟踪', status: 'warning', date: '2026-09-01', detail: '《建设工程质量检测管理办法》已生效，建议组织培训' },
]

export default function Compliance() {
  const [selectedReg, setSelectedReg] = useState(null)
  const [complianceScore, setComplianceScore] = useState(96)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEquipment()
    fetchStaff()
    // Calculate compliance score based on real data
    const warnCount = equipment?.filter(e => e.status === 'warning').length || 0
    const expiringCerts = equipment?.filter(e => {
      if (!e.cert_due) return false
      const days = Math.ceil((new Date(e.cert_due) - new Date()) / 86400000)
      return days < 30 && days > 0
    }).length
    const score = Math.max(0, 100 - warnCount * 5 - expiringCerts * 10)
    setComplianceScore(score)
    setLoading(false)
  }, [])

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>合规风控</Title>
          <Text type="secondary">法规跟踪 · 合规检查 · 风险预警</Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none' }}>AI合规审查</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '法规总数', value: regulations.length, icon: '📋', color: '#1890ff' },
          { label: '待更新', value: 1, icon: '🔄', color: '#faad14' },
          { label: '合规得分', value: '96', icon: '🎯', color: '#52c41a' },
          { label: '风险项', value: 1, icon: '⚠️', color: '#ff4d4f' },
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

      <Alert type="warning" showIcon message="近期风险提醒" description={<ul style={{ margin: 0, paddingLeft: 20 }}>{[
  ...(equipment?.filter(e => e.status === 'warning').map(e => `设备${e.id}(${e.name})检定即将到期`)),
  '《建设工程质量检测管理办法》已生效，建议组织全员培训',
  '建议开展Q3季度合规自查'
].map((t, i) => <li key={i}>{t}</li>)}</ul>} style={{ marginBottom: 16, borderRadius: 8 }} />

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="📚 法规库" style={{ borderRadius: 12 }}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2 }}
              dataSource={regulations}
              renderItem={reg => (
                <List.Item>
                  <Card hoverable style={{ borderRadius: 12, cursor: 'pointer', height: '100%' }} onClick={() => setSelectedReg(reg)}>
                    <Space wrap>
                      <Tag color={reg.level === 'high' ? 'red' : 'orange'}>{reg.type}</Tag>
                      <Tag color="gold">已更新</Tag>
                    </Space>
                    <Title level={5} style={{ marginTop: 12, marginBottom: 8, fontSize: 14 }}>{reg.title}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>发布部门：{reg.dept} · 生效日期：{reg.date}</Text>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c', lineHeight: 1.6 }}>{reg.summary}</div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title={<><span>✅ 合规检查</span><Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>最近一次：2026-09-15</Text></>} style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
            {complianceChecks.map(item => (
              <div key={item.id} style={{ padding: '12px 0', borderBottom: item.id === complianceChecks.length ? 'none' : '1px solid #f0f0f0' }}>
                <Space>
                  <SafetyOutlined style={{ color: item.status === 'pass' ? '#52c41a' : '#faad14', fontSize: 16 }} />
                  <Text strong style={{ fontSize: 13 }}>{item.name}</Text>
                </Space>
                <div style={{ marginLeft: 28, fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{item.detail}</div>
                <div style={{ marginLeft: 28, fontSize: 11, color: '#bfbfbf' }}>{item.date}</div>
              </div>
            ))}
            <Button type="primary" block style={{ marginTop: 16 }}>开始新一轮合规检查</Button>
          </Card>
        </Col>
      </Row>

      <Modal title={<><BookOutlined /> 法规详情</>} open={!!selectedReg} onCancel={() => setSelectedReg(null)} footer={[<Button key="close" onClick={() => setSelectedReg(null)}>关闭</Button>, <Button key="apply" type="primary">应用于当前业务</Button>]} width={640}>
        {selectedReg && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><Text strong>法规名称：</Text><br />{selectedReg.title}</div>
              <div><Text strong>发布部门：</Text><br />{selectedReg.dept}</div>
              <div><Text strong>法规类型：</Text><br /><Tag>{selectedReg.type}</Tag></div>
              <div><Text strong>生效日期：</Text><br />{selectedReg.date}</div>
              <Divider />
              <div><Text strong>内容摘要：</Text></div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, lineHeight: 1.8 }}>{selectedReg.summary}</div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}
