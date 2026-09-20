import { useState } from 'react'
import {
  Row, Col, Card, Button, Space, Typography, Modal, Tag, Badge,
  List, Input, Select, Slider, Switch, Divider, Tabs, message, Alert
} from 'antd'
import {
  RobotOutlined, SettingOutlined, MessageOutlined, ThunderboltOutlined,
  BrainOutlined, ClockCircleOutlined, CheckCircleOutlined,
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined,
  BulbOutlined, FireOutlined, SettingsOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

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

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState([])
  const [inputMsg, setInputMsg] = useState('')
  const [activeAgent, setActiveAgent] = useState(null)

  const handleChat = (agent) => {
    setActiveAgent(agent)
    setChatOpen(true)
    setChatMsg([{ role: 'agent', content: `你好！我是${agent.name}(${agent.role})，有什么可以帮您的？`, time: '刚刚' }])
  }

  const sendMessage = () => {
    if (!inputMsg.trim()) return
    setChatMsg([...chatMsg, { role: 'user', content: inputMsg, time: '刚刚' }])
    const replies = {
      '智管': '根据今日数据，项目A进度略有滞后，建议关注。应收账款本周有3笔到期，需跟进回款。',
      '智财': '本月预算执行率51%，人力成本略超预期，建议优化外包人员配置。',
      '智项': 'YY桥梁项目报告已初稿，预计3天内可完成。ZZ小区项目需加快进度，否则有延期风险。',
      '智检': 'XX大厦检测报告已初审通过，结论为合格。建议对回弹法数据进行复核确认。',
      '智人': '本周有3名员工证书到期，已发送续期提醒。新员工培训安排在周三下午。',
      '智客': 'XX地产集团有新项目意向，建议本周内安排拜访。客户满意度调查结果显示整体良好。',
      '智法': '最新《建设工程质量检测管理办法》已生效，建议组织全员学习。合规检查结果：96分。',
      '智设': 'SB003设备检定将在11天后到期，建议本周安排送检。预测性维护显示XX设备需关注。'
    }
    setTimeout(() => {
      setChatMsg(prev => [...prev, {
        role: 'agent',
        content: replies[activeAgent?.name] || '我已收到您的问题，正在分析处理中...',
        time: '刚刚'
      }])
    }, 800)
    setInputMsg('')
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>数字员工中心</Title>
          <Text type="secondary">8位AI数字员工 · 各司其职 · 协同办公</Text>
        </div>
        <Button icon={<SettingsOutlined />} onClick={() => setConfigOpen(true)}>全局配置</Button>
      </div>

      {/* 在线状态统计 */}
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

      {/* 数字员工卡片 */}
      <Row gutter={[16, 16]}>
        {agents.map(agent => (
          <Col xs={24} sm={12} md={8} lg={6} key={agent.id}>
            <Card
              className="ai-agent-card"
              style={{ borderRadius: 12, height: '100%' }}
              onClick={() => setSelectedAgent(agent)}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div className="agent-avatar" style={{ background: `linear-gradient(135deg, ${agent.color}22 0%, ${agent.color}44 100%)`, border: `2px solid ${agent.color}` }}>
                  <span style={{ fontSize: 32 }}>{agent.avatar}</span>
                </div>
                <Badge
                  status={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'processing' : 'default'}
                  style={{ position: 'absolute', bottom: 0, right: 0 }}
                />
              </div>
              <div className="agent-name" style={{ marginTop: 12 }}>{agent.name}</div>
              <div className="agent-role">{agent.role}</div>
              <div className="agent-status">
                <span>{agent.status === 'online' ? '●' : agent.status === 'busy' ? '◉' : '○'}</span>
                {agent.status === 'online' ? '在线' : agent.status === 'busy' ? '工作中' : '离线'}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
                完成任务: <Text style={{ color: agent.color, fontWeight: 600 }}>{agent.tasksDone}</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Space size={4} wrap>
                  {agent.skills.slice(0, 2).map(s => <Tag key={s} color={agent.color} style={{ fontSize: 11 }}>{s}</Tag>)}
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 员工详情弹窗 */}
      <Modal
        title={
          <Space>
            <span style={{ fontSize: 24 }}>{selectedAgent?.avatar}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{selectedAgent?.name}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{selectedAgent?.role}</div>
            </div>
          </Space>
        }
        open={!!selectedAgent}
        onCancel={() => setSelectedAgent(null)}
        footer={[
          <Button key="config" icon={<SettingOutlined />} onClick={() => { setSelectedAgent(null); setConfigOpen(true) }}>配置</Button>,
          <Button key="stop" icon={<StopOutlined />}>停止运行</Button>,
          <Button key="chat" type="primary" icon={<MessageOutlined />} onClick={() => { handleChat(selectedAgent); setSelectedAgent(null) }}>对话</Button>
        ]}
        width={560}
      >
        {selectedAgent && (
          <div>
            <Paragraph>{selectedAgent.desc}</Paragraph>
            <Divider orientation="left" orientationColor={selectedAgent.color}>核心能力</Divider>
            <Space wrap style={{ marginBottom: 16 }}>
              {selectedAgent.skills.map(s => <Tag key={s} color={selectedAgent.color}>{s}</Tag>)}
            </Space>
            <Divider orientation="left" orientationColor={selectedAgent.color}>当前任务</Divider>
            <Space wrap>
              {selectedAgent.tasks.map(t => (
                <Tag key={t} color="cyan" icon={<ClockCircleOutlined />}>{t}</Tag>
              ))}
            </Space>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>累计完成任务: <Text strong>{selectedAgent.tasksDone}</Text></span>
              <span>运行状态: <Badge status={selectedAgent.status === 'online' ? 'success' : selectedAgent.status === 'busy' ? 'processing' : 'default'} text={selectedAgent.status === 'online' ? '在线' : selectedAgent.status === 'busy' ? '工作中' : '离线'} /></span>
            </div>
          </div>
        )}
      </Modal>

      {/* 聊天弹窗 */}
      <Modal
        title={<Space><RobotOutlined />与{activeAgent?.name}对话</Space>}
        open={chatOpen}
        onCancel={() => setChatOpen(false)}
        footer={null}
        width={520}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {chatMsg.map((msg, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
                  background: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  fontSize: 13
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
            <Input
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onPressEnter={sendMessage}
              placeholder="输入消息..."
              allowClear
            />
            <Button type="primary" icon={<MessageOutlined />} onClick={sendMessage}>发送</Button>
          </div>
        </div>
      </Modal>

      {/* 全局配置弹窗 */}
      <Modal
        title={<><SettingsOutlined /> 数字员工全局配置</>}
        open={configOpen}
        onCancel={() => setConfigOpen(false)}
        footer={[<Button key="close" onClick={() => setConfigOpen(false)}>关闭</Button>, <Button key="save" type="primary" onClick={() => { message.success('配置已保存'); setConfigOpen(false) }}>保存配置</Button>]}
        width={640}
      >
        <Alert message="全局配置影响所有数字员工的运行参数，请谨慎修改" type="warning" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
        <Tabs items={[
          {
            key: 'general', label: '基础设置',
            children: (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>模型选择</Text>
                  <Select defaultValue="gpt-4" style={{ width: '100%', marginTop: 8 }} options={[{ value: 'gpt-4', label: 'GPT-4' }, { value: 'gpt-3.5', label: 'GPT-3.5-Turbo' }, { value: 'local', label: '本地模型' }]} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>响应温度: <span style={{ color: '#1890ff' }}>{80}</span></Text>
                  <Slider min={0} max={100} defaultValue={80} style={{ marginTop: 8 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>自动响应模式</Text>
                  <Switch defaultChecked style={{ marginLeft: 8 }} />
                  <Text type="secondary" style={{ marginLeft: 8 }}>开启后数字员工可自动处理常规任务</Text>
                </div>
              </div>
            )
          },
          {
            key: 'agents', label: '员工配置',
            children: (
              <List
                dataSource={agents}
                renderItem={agent => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <Space>
                      <span style={{ fontSize: 20 }}>{agent.avatar}</span>
                      <div>
                        <Text strong>{agent.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>{agent.role}</Text>
                      </div>
                      <Badge status={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'processing' : 'default'} />
                      <Switch defaultChecked size="small" />
                    </Space>
                  </List.Item>
                )}
              />
            )
          },
          {
            key: 'notify', label: '通知设置',
            children: (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>异常预警通知</Text>
                  <Switch defaultChecked style={{ marginLeft: 8 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>每日简报推送</Text>
                  <Switch defaultChecked style={{ marginLeft: 8 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>任务完成通知</Text>
                  <Switch defaultChecked style={{ marginLeft: 8 }} />
                </div>
                <div>
                  <Text strong>紧急事项即时通知</Text>
                  <Switch defaultChecked style={{ marginLeft: 8 }} />
                </div>
              </div>
            )
          }
        ]} />
      </Modal>
    </div>
  )
}
