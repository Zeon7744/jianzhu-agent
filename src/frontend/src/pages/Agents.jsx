import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Space, Button, Divider, Input, Tag, Modal, Alert, Badge, Spin } from 'antd'
import { RobotOutlined, SettingOutlined, MessageOutlined, SyncOutlined } from '@ant-design/icons'
import { useStore } from '../store'

const { Title, Text } = Typography

export default function Agents() {
  const { agents, fetchAgents, agentChat, agentCollaborativeAnalysis, agentLogs, fetchAgentLogs } = useStore()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [chatMsg, setChatMsg] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [activeAgent, setActiveAgent] = useState(null)
  const [chatRisks, setChatRisks] = useState([])
  const [chatSuggestions, setChatSuggestions] = useState([])
  const [chatOpportunities, setChatOpportunities] = useState([])
  const [collabOpen, setCollabOpen] = useState(false)
  const [collabQuery, setCollabQuery] = useState('')
  const [collabResult, setCollabResult] = useState(null)
  const [collabLoading, setCollabLoading] = useState(false)
  const [logsFilter, setLogsFilter] = useState('all')

  useEffect(() => { fetchAgents(); fetchAgentLogs() }, [])

  const handleChat = (agent) => {
    setActiveAgent(agent); setChatOpen(true)
    setChatMsg([{ role: 'agent', content: `你好！我是${agent.name}（${agent.role}），${agent.desc}。请问有什么可以帮您？`, time: '刚刚' }])
    setChatRisks([]); setChatSuggestions([]); setChatOpportunities([])
  }

  const sendMessage = async () => {
    if (!inputMsg.trim() || !activeAgent || sending) return
    const msg = inputMsg
    setChatMsg(prev => [...prev, { role: 'user', content: msg, time: '刚刚' }])
    setInputMsg(''); setSending(true)
    try {
      const data = await agentChat(activeAgent.name, msg)
      setChatMsg(prev => [...prev, { role: 'agent', content: data?.reply || '正在分析...', time: '刚刚' }])
      setChatRisks(data?.risks || [])
      setChatSuggestions(data?.suggestions || [])
      setChatOpportunities(data?.opportunities || [])
    } catch (e) {
      setChatMsg(prev => [...prev, { role: 'agent', content: '服务暂不可用，请稍后重试', time: '刚刚' }])
    } finally { setSending(false) }
  }

  const runCollaboration = async () => {
    if (!collabQuery.trim() || collabLoading) return
    setCollabLoading(true)
    try {
      const data = await agentCollaborativeAnalysis(collabQuery, '智管', ['智财', '智项', '智检'])
      setCollabResult(data)
    } catch (e) { setCollabResult({ error: '协作分析失败，请稍后重试' }) }
    finally { setCollabLoading(false) }
  }

  const filteredLogs = logsFilter === 'all' ? agentLogs : agentLogs.filter(l => l.agent === logsFilter)

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><Title level={4} style={{ margin: 0 }}>数字员工中心</Title><Text type="secondary">{agents.length}位AI数字员工 · 各司其职 · 协同办公</Text></div>
        <Space>
          <Button icon={<SyncOutlined />} onClick={() => fetchAgents()}>刷新</Button>
          <Button icon={<SettingOutlined />} onClick={() => setConfigOpen(true)}>全局配置</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: '数字员工总数', value: agents.length, color: '#1890ff' },
          { label: '在线运行', value: agents.filter(a => a.status === 'online').length, color: '#52c41a' },
          { label: '忙碌处理', value: agents.filter(a => a.status === 'busy').length, color: '#faad14' },
          { label: '今日交互记录', value: agentLogs.length, color: '#722ed1' },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{s.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {agents.map(agent => (
          <Col xs={24} sm={12} md={8} lg={6} key={agent.id || agent.name}>
            <Card className="ai-agent-card" style={{ borderRadius: 12, height: '100%', cursor: 'pointer' }} onClick={() => setSelectedAgent(agent)}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  className="agent-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${agent.color}22 0%, ${agent.color}44 100%)`,
                    border: `2px solid ${agent.color}`,
                    width: 64, height: 64, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', fontSize: 32
                  }}
                >{agent.avatar || '🤖'}</div>
                <span style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: agent.status === 'online' ? '#52c41a' : agent.status === 'busy' ? '#faad14' : '#d9d9d9', border: '2px solid #fff' }} />
              </div>
              <div className="agent-name" style={{ marginTop: 12, textAlign: 'center', fontWeight: 600 }}>{agent.name}</div>
              <div className="agent-role" style={{ textAlign: 'center', fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{agent.role}</div>
              <div style={{ textAlign: 'center', fontSize: 12, marginBottom: 12 }}>
                <Badge status={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'processing' : 'default'} text={agent.status === 'online' ? '在线' : agent.status === 'busy' ? '工作中' : '离线'} />
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                专长: <Text style={{ color: agent.color, fontWeight: 600 }}>{(agent.skills || []).slice(0, 2).join(', ')}</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Space size={4} wrap justify="center">{(agent.skills || []).slice(0, 3).map((s, i) => <Tag key={i} color={agent.color} style={{ fontSize: 11 }}>{s}</Tag>)}</Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal title={<Space><span style={{ fontSize: 24 }}>{selectedAgent?.avatar || '🤖'}</span><div><div style={{ fontWeight: 700 }}>{selectedAgent?.name}</div><div style={{ fontSize: 12, color: '#8c8c8c' }}>{selectedAgent?.role}</div></div></Space>} open={!!selectedAgent} onCancel={() => setSelectedAgent(null)} footer={[<Button key="config" icon={<SettingOutlined />} onClick={() => { setSelectedAgent(null); setConfigOpen(true) }}>配置</Button>, <Button key="chat" type="primary" icon={<MessageOutlined />} onClick={() => { handleChat(selectedAgent); setSelectedAgent(null) }}>对话</Button>]} width={560}>
        {selectedAgent && (<div><Text>{selectedAgent.desc}</Text><Divider orientation="left" orientationColor={selectedAgent.color}>核心能力</Divider><Space wrap style={{ marginBottom: 16 }}>{(selectedAgent.skills || []).map((s, i) => <Tag key={i} color={selectedAgent.color}>{s}</Tag>)}</Space><Divider orientation="left" orientationColor={selectedAgent.color}>协作关系</Divider><Text type="secondary">全局协同，按需联动</Text><Divider /><Space direction="vertical" style={{ width: '100%' }}>
          <div><Text type="secondary">运行状态: </Text><Badge status={selectedAgent.status === 'online' ? 'success' : selectedAgent.status === 'busy' ? 'processing' : 'default'} text={selectedAgent.status === 'online' ? '在线' : selectedAgent.status === 'busy' ? '工作中' : '离线'} /></div>
          <div><Text type="secondary">所属领域: </Text><Text>{(selectedAgent.domains || []).join(', ')}</Text></div>
          <div><Text type="secondary">响应风格: </Text><Text>{selectedAgent.response_style || '专业简洁'}</Text></div>
        </Space></div>)}
      </Modal>

      <Modal title={<Space><RobotOutlined />与{activeAgent?.name}对话</Space>} open={chatOpen} onCancel={() => setChatOpen(false)} footer={null} width={560}>
        <div style={{ minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fafafa', borderRadius: 8, marginBottom: 12 }}>
            {chatMsg.map((msg, i) => (<div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}><div style={{ maxWidth: '82%', padding: '10px 14px', borderRadius: 12, background: msg.role === 'user' ? '#1890ff' : '#fff', color: msg.role === 'user' ? '#fff' : '#333', fontSize: 13, whiteSpace: 'pre-wrap', boxShadow: msg.role === 'agent' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', border: msg.role === 'agent' ? '1px solid #f0f0f0' : 'none' }}>{msg.content}</div></div>))}
            {sending && <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12, padding: 8 }}><Spin size="small" />AI思考中...</div>}
          </div>
          {(chatRisks.length > 0 || chatSuggestions.length > 0 || chatOpportunities.length > 0) && (
            <div style={{ marginBottom: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0' }}>
              {chatRisks.length > 0 && (<div style={{ marginBottom: 8 }}><Text strong style={{ color: '#ff4d4f', fontSize: 12 }}>风险提示</Text>{chatRisks.map((r, i) => <div key={i} style={{ fontSize: 12, color: '#cf1322', padding: '2px 0' }}>{"\u2022"} {r}</div>)}</div>)}
              {chatOpportunities.length > 0 && (<div style={{ marginBottom: 8 }}><Text strong style={{ color: '#52c41a', fontSize: 12 }}>商机发现</Text>{chatOpportunities.map((o, i) => <div key={i} style={{ fontSize: 12, color: '#389e0d', padding: '2px 0' }}>{"\u2022"} {o}</div>)}</div>)}
              {chatSuggestions.length > 0 && (<div><Text strong style={{ color: '#1890ff', fontSize: 12 }}>建议</Text>{chatSuggestions.map((s, i) => <div key={i} style={{ fontSize: 12, color: '#096dd9', padding: '2px 0' }}>{"\u2022"} {s}</div>)}</div>)}
            </div>
          )}
          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
            <Input value={inputMsg} onChange={e => setInputMsg(e.target.value)} onPressEnter={sendMessage} placeholder="输入消息..." allowClear style={{ flex: 1 }} disabled={sending} />
            <Button type="primary" icon={<MessageOutlined />} onClick={sendMessage} loading={sending}>发送</Button>
          </div>
        </div>
      </Modal>

      <Modal title={<Space><SyncOutlined />多Agent协作分析</Space>} open={collabOpen} onCancel={() => { setCollabOpen(false); setCollabResult(null) }} footer={null} width={640}>
        <div style={{ padding: 8 }}>
          <Space style={{ marginBottom: 16, width: '100%', display: 'flex' }}>
            <input value={collabQuery} onChange={e => setCollabQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runCollaboration()} placeholder="输入分析主题，如：本月经营风险分析" style={{ flex: 1, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, outline: 'none' }} />
            <Button type="primary" icon={<SyncOutlined />} onClick={runCollaboration} loading={collabLoading}>开始协作</Button>
          </Space>
          {collabLoading && <div style={{ textAlign: 'center', padding: 20 }}><Spin /><Text type="secondary"> 多Agent协作分析中...</Text></div>}
          {collabResult && !collabResult.error && (
            <div>
              <Alert type="success" message={`主分析Agent: ${collabResult.primary_agent}`} showIcon style={{ marginBottom: 12 }} />
              {collabResult.all_risks?.length > 0 && (<div style={{ marginBottom: 12 }}><Text strong style={{ color: '#ff4d4f' }}>综合风险 ({collabResult.all_risks.length})</Text>{collabResult.all_risks.map((r, i) => <div key={i} style={{ fontSize: 12, color: '#cf1322', padding: '2px 0' }}>{"\u2022"} {r}</div>)}</div>)}
              {collabResult.all_suggestions?.length > 0 && (<div style={{ marginBottom: 12 }}><Text strong style={{ color: '#1890ff' }}>综合建议</Text>{collabResult.all_suggestions.map((s, i) => <div key={i} style={{ fontSize: 12, color: '#096dd9', padding: '2px 0' }}>{"\u2022"} {s}</div>)}</div>)}
              {collabResult.collaboration_results?.map((cr, i) => (<Card key={i} size="small" title={`${cr.agent} 分析`}>
                <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{cr.result?.summary || '无数据'}</div>
              </Card>))}
            </div>
          )}
          {collabResult?.error && <Alert type="error" message={collabResult.error} showIcon />}
        </div>
      </Modal>

      <Modal title={<><SettingOutlined /> 数字员工全局配置</>} open={configOpen} onCancel={() => setConfigOpen(false)} footer={[<Button key="close" onClick={() => setConfigOpen(false)}>关闭</Button>, <Button key="save" type="primary">保存配置</Button>]} width={640}>
        <Alert message="全局配置影响所有数字员工的运行参数，请谨慎修改" type="warning" showIcon style={{ marginBottom: 16 }} />
        <Space direction="vertical" style={{ width: '100%' }}>
          {[{ label: '模型选择', value: 'gpt-4' }, { label: '响应温度', value: 80 }, { label: '自动响应模式', value: true }, { label: '异常预警通知', value: true }, { label: '每日简报推送', value: true }].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8 }}>
              <Text>{item.label}</Text>
              {typeof item.value === 'boolean' ? <span style={{ color: item.value ? '#52c41a' : '#ff4d4f' }}>{item.value ? '开' : '关'}</span> : <Text code>{item.value}</Text>}
            </div>
          ))}
        </Space>
      </Modal>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button type="dashed" icon={<SyncOutlined />} size="large" onClick={() => setCollabOpen(true)}>发起多Agent协作分析</Button>
      </div>
    </div>
  )
}
