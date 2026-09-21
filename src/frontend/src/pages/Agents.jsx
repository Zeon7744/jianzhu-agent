import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Space, Button, Divider, Input, List, Tag } from 'antd'
import { RobotOutlined, SettingOutlined, ThunderboltOutlined, MessageOutlined, UserOutlined, BellOutlined } from '@ant-design/icons'
import { useStore } from '../store'

const { Title, Text } = Typography

const agents = [
  { id: 1, name: '智管', role: '总经理助理', avatar: '🧠', color: '#1890ff', status: 'online', tasks: ['经营分析', '决策建议', '资源调配'], tasksDone: 156, skills: ['数据分析', '战略规划', '沟通协调'], desc: '协助总经理进行全局经营监控、数据分析、决策建议和资源调配，每日自动生成经营简报。' },
  { id: 2, name: '智财', role: '财务主管', avatar: '💰', color: '#52c41a', status: 'online', tasks: ['账务处理', '成本核算', '税务合规'], tasksDone: 342, skills: ['财务分析', '预算管控', '税务筹划'], desc: '处理日常账务、成本核算、预算管理、税务合规检查，自动生成财务报表和分析报告。' },
  { id: 3, name: '智项', role: '项目经理', avatar: '📋', color: '#722ed1', status: 'busy', tasks: ['进度管控', '质量把关', '协调沟通'], tasksDone: 89, skills: ['项目管控', '风险预警', '资源协调'], desc: '跟踪项目进度、预警延期风险、协调各方资源，自动生成项目日报和周报。' },
  { id: 4, name: '智检', role: '检测主管', avatar: '🔬', color: '#eb2f96', status: 'online', tasks: ['标准匹配', '报告审核', '质量控制'], tasksDone: 567, skills: ['标准匹配', '报告生成', '质量审核'], desc: '智能匹配检测标准、辅助生成检测报告、审核报告质量，确保检测数据准确可靠。' },
  { id: 5, name: '智人', role: 'HR主管', avatar: '👥', color: '#faad14', status: 'offline', tasks: ['招聘配置', '培训管理', '绩效考核'], tasksDone: 234, skills: ['人才评估', '培训规划', '薪酬设计'], desc: '管理员工档案、资质追踪、智能排班、培训安排，自动提醒证书到期和培训需求。' },
  { id: 6, name: '智客', role: '客户总监', avatar: '🤝', color: '#13c2c2', status: 'online', tasks: ['客户维护', '商机挖掘', '服务跟进'], tasksDone: 178, skills: ['客户分析', '商机识别', '满意度管理'], desc: '管理客户关系、挖掘商机机会、跟踪服务满意度，智能推荐客户维护和跟进策略。' },
  { id: 7, name: '智法', role: '合规顾问', avatar: '⚖️', color: '#2f4554', status: 'online', tasks: ['法规跟踪', '风险提示', '合规审查'], tasksDone: 445, skills: ['法规检索', '风险分析', '合规审查'], desc: '实时跟踪法规更新、评估合规风险、辅助合规审查，提前预警可能的合规问题。' },
  { id: 8, name: '智设', role: '设备管理员', avatar: '🔧', color: '#fa8c16', status: 'busy', tasks: ['台账管理', '维护计划', '检定追踪'], tasksDone: 312, skills: ['设备管理', '预测维护', '检定管理'], desc: '管理设备台账、制定维护计划、追踪检定状态，预测设备故障并提前安排维护。' },
]

const agentResponses = {
  '智管': '根据今日数据，项目A进度略有滞后，建议关注。应收账款本周有3笔到期，需跟进回款。\n\n📊 经营简报：\n• 在研项目：4个（2个进行中）\n• 本月预计收入：185万\n• 主要风险：项目延期（75分）',
  '智财': '本月财务状况：\n\n💰 收入：185.6万元（较上月+12%）\n📉 支出：136万元（较上月+5%）\n💵 利润：49.6万元（利润率26.7%）\n\n⚠️ 预算执行：人力成本51%，设备采购57%，建议关注。',
  '智项': '项目状态更新：\n\n🔴 高风险：ZZ小区房屋安全鉴定（进度45%，截止10/08）\n🟡 中风险：XX大厦主体结构检测（进度75%，截止10/15）\n🟢 正常：YY桥梁荷载试验（进度90%，即将完成）\n\n💡 建议优先处理ZZ小区项目。',
  '智检': '检测任务分析：\n\n📋 本月检测批次：156次，合格率98.5%\n⏱️ 待检测：3批次\n🔬 报告中：2批次\n\n💡 XX大厦混凝土强度检测报告已通过初审，建议复核回弹数据。',
  '智人': '人力资源情况：\n\n👥 在职人数：8人，技术人员6人\n📜 证书到期：3人即将到期，已发送续期提醒\n📅 排班建议：本周6个项目并行，建议增派2人\n\n💡 新员工培训安排在周三下午。',
  '智客': '客户关系分析：\n\n⭐ 优质客户：XX地产集团、市交通局\n💼 新增商机：AA建设集团新项目意向\n📞 待回访：5家客户超过30天未联系\n\n💡 建议本周内完成重点客户回访。',
  '智法': '合规审查结果：\n\n✅ 资质证书：全部有效\n✅ 人员持证：100%覆盖\n⚠️ 设备检定：SB003即将到期(11天)\n\n💡 新法规《建设工程质量检测管理办法》已生效，建议组织培训。',
  '智设': '设备管理报告：\n\n🔧 设备总数：8台，完好率87.5%\n⚠️ 需关注：SB003钢筋扫描仪检定即将到期\n🔍 预测维护：万能试验机建议下周润滑保养\n\n💡 建议本周安排SB003送检。',
}

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [activeAgent, setActiveAgent] = useState(null)
  const logAgentAction = useStore(s => s.logAgentAction)
  const fetchAgentLogs = useStore(s => s.fetchAgentLogs)
  const agentLogs = useStore(s => s.agentLogs)
  const [logsFilter, setLogsFilter] = useState('all')

  const handleChat = (agent) => {
    setActiveAgent(agent)
    setChatOpen(true)
    setChatMsg([{ role: 'agent', content: `你好！我是${agent.name}(${agent.role})，有什么可以帮您的？`, time: '刚刚' }])
  }

  const sendMessage = () => {
    if (!inputMsg.trim()) return
    const msg = inputMsg
    setChatMsg(prev => [...prev, { role: 'user', content: msg, time: '刚刚' }])
    setInputMsg('')

    setTimeout(() => {
      const response = agentResponses[activeAgent?.name] || '我已收到您的问题，正在分析处理中...'
      setChatMsg(prev => [...prev, { role: 'agent', content: response, time: '刚刚' }])
      logAgentAction(activeAgent?.name, 'chat', msg, 'handled')
    }, 1000)
  }

  useEffect(() => {
    fetchAgentLogs()
  }, [])

  const filteredLogs = logsFilter === 'all'
    ? agentLogs
    : agentLogs.filter(l => l.agent === logsFilter)

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>数字员工中心</Title>
          <Text type="secondary">8位AI数字员工 · 各司其职 · 协同办公</Text>
        </div>
        <Button icon={<SettingOutlined />} onClick={() => setConfigOpen(true)}>全局配置</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '数字员工总数', value: agents.length, icon: '🤖', color: '#1890ff' },
          { label: '在线运行', value: agents.filter(a => a.status === 'online').length, icon: '✅', color: '#52c41a' },
          { label: '忙碌处理', value: agents.filter(a => a.status === 'busy').length, icon: '⚡', color: '#faad14' },
          { label: '今日完成任务', value: '2,487', icon: '📊', color: '#722ed1' },
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

      <Row gutter={[16, 16]}>
        {agents.map(agent => (
          <Col xs={24} sm={12} md={8} lg={6} key={agent.id}>
            <Card className="ai-agent-card" style={{ borderRadius: 12, height: '100%', cursor: 'pointer' }} onClick={() => setSelectedAgent(agent)}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div className="agent-avatar" style={{ background: `linear-gradient(135deg, ${agent.color}22 0%, ${agent.color}44 100%)`, border: `2px solid ${agent.color}`, width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 32 }}>
                  {agent.avatar}
                </div>
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: agent.status === 'online' ? '#52c41a' : agent.status === 'busy' ? '#faad14' : '#d9d9d9', border: '2px solid #fff' }} />
              </div>
              <div className="agent-name" style={{ marginTop: 12, textAlign: 'center', fontWeight: 600 }}>{agent.name}</div>
              <div className="agent-role" style={{ textAlign: 'center', fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{agent.role}</div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#52c41a', marginBottom: 12 }}>
                {agent.status === 'online' ? '● 在线' : agent.status === 'busy' ? '◉ 工作中' : '○ 离线'}
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#8c8c8c', marginBottom: 12 }}>
                完成任务: <Text style={{ color: agent.color, fontWeight: 600 }}>{agent.tasksDone}</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Space size={4} wrap justify="center">
                  {agent.skills.slice(0, 2).map(s => <Tag key={s} color={agent.color} style={{ fontSize: 11 }}>{s}</Tag>)}
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Agent Detail Modal */}
      <Modal title={<Space><span style={{ fontSize: 24 }}>{selectedAgent?.avatar}</span><div><div style={{ fontWeight: 700 }}>{selectedAgent?.name}</div><div style={{ fontSize: 12, color: '#8c8c8c' }}>{selectedAgent?.role}</div></div></Space>} open={!!selectedAgent} onCancel={() => setSelectedAgent(null)} footer={[<Button key="config" icon={<SettingOutlined />} onClick={() => { setSelectedAgent(null); setConfigOpen(true) }}>配置</Button>, <Button key="stop" icon={<ThunderboltOutlined />}>停止运行</Button>, <Button key="chat" type="primary" icon={<MessageOutlined />} onClick={() => { handleChat(selectedAgent); setSelectedAgent(null) }}>对话</Button>]} width={560}>
        {selectedAgent && (
          <div>
            <Text>{selectedAgent.desc}</Text>
            <Divider orientation="left" orientationColor={selectedAgent.color}>核心能力</Divider>
            <Space wrap style={{ marginBottom: 16 }}>
              {selectedAgent.skills.map(s => <Tag key={s} color={selectedAgent.color}>{s}</Tag>)}
            </Space>
            <Divider orientation="left" orientationColor={selectedAgent.color}>当前任务</Divider>
            <Space wrap>
              {selectedAgent.tasks.map(t => (<Tag key={t} color="cyan"><ThunderboltOutlined /> {t}</Tag>))}
            </Space>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><Text type="secondary">累计完成任务: </Text><Text strong>{selectedAgent.tasksDone}</Text></div>
              <div><Text type="secondary">运行状态: </Text><span style={{ color: selectedAgent.status === 'online' ? '#52c41a' : selectedAgent.status === 'busy' ? '#faad14' : '#d9d9d9' }}>{selectedAgent.status === 'online' ? '在线' : selectedAgent.status === 'busy' ? '工作中' : '离线'}</span></div>
            </Space>
          </div>
        )}
      </Modal>

      {/* Chat Modal */}
      <Modal title={<Space><RobotOutlined />与{activeAgent?.name}对话</Space>} open={chatOpen} onCancel={() => setChatOpen(false)} footer={null} width={520}>
        <div style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {chatMsg.map((msg, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 12, background: msg.role === 'user' ? '#1890ff' : '#f0f0f0', color: msg.role === 'user' ? '#fff' : '#333', fontSize: 13, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
            <Input value={inputMsg} onChange={e => setInputMsg(e.target.value)} onPressEnter={sendMessage} placeholder="输入消息..." allowClear style={{ flex: 1 }} />
            <Button type="primary" icon={<MessageOutlined />} onClick={sendMessage}>发送</Button>
          </div>
        </div>
      </Modal>

      {/* Config Modal */}
      <Modal title={<><SettingOutlined /> 数字员工全局配置</>} open={configOpen} onCancel={() => setConfigOpen(false)} footer={[<Button key="close" onClick={() => setConfigOpen(false)}>关闭</Button>, <Button key="save" type="primary" onClick={() => { /* TODO */ }}>保存配置</Button>]} width={640}>
        <Alert message="全局配置影响所有数字员工的运行参数，请谨慎修改" type="warning" showIcon style={{ marginBottom: 16 }} />
        <Space direction="vertical" style={{ width: '100%' }}>
          {[
            { label: '模型选择', value: 'gpt-4' },
            { label: '响应温度', value: 80 },
            { label: '自动响应模式', value: true },
            { label: '异常预警通知', value: true },
            { label: '每日简报推送', value: true },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8 }}>
              <Text>{item.label}</Text>
              {typeof item.value === 'boolean' ? <span style={{ color: item.value ? '#52c41a' : '#ff4d4f' }}>{item.value ? '开' : '关'}</span> : <Text code>{item.value}</Text>}
            </div>
          ))}
        </Space>
      </Modal>
    </div>
  )
}
