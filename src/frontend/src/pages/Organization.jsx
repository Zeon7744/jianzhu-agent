import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Typography, Space, Badge, Tooltip } from 'antd'
import { TeamOutlined, ToolOutlined, FileTextOutlined, SafetyOutlined, DashboardOutlined, SettingOutlined, ShoppingCartOutlined, PieChartOutlined, DatabaseOutlined } from '@ant-design/icons'
import { useStore } from '../store'
const { Title, Text } = Typography

const PAGE_META = {
  policies:  { icon: <FileTextOutlined />, label: '制度管理' },
  qualifications: { icon: <Badge status="success" />, label: '资质管理' },
  training:  { icon: <TeamOutlined />, label: '培训管理' },
  organization: { icon: <DashboardOutlined />, label: '组织架构' },
  processes: { icon: <SettingOutlined />, label: '业务流程' },
}

export default function Organization() {
  const { token, staff, fetchStaff } = useStore()
  const [depts, setDepts] = useState([])
  const [processes, setProcesses] = useState([])
  const [selectedProcess, setSelectedProcess] = useState(null)
  const [steps, setSteps] = useState([])

  useEffect(() => {
    fetchStaff()
    loadOrg()
    loadProcesses()
  }, [])

  const loadOrg = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/org/departments', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setDepts(data || [])
    } catch (e) { console.error(e) }
  }

  const loadProcesses = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/business-processes', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setProcesses(data || [])
    } catch (e) { console.error(e) }
  }

  const loadSteps = async (pid) => {
    try {
      const res = await fetch(`http://localhost:8000/api/process-steps/${pid}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setSteps(data || [])
    } catch (e) { setSteps([]) }
  }

  const handleProcessClick = (p) => {
    setSelectedProcess(p)
    loadSteps(p.id)
  }

  const deptMap = { '技术部': 'blue', '检测部': 'green', '咨询部': 'purple', '安全部': 'orange', '质量部': 'cyan', '综合部': 'magenta', '财务部': 'red', '总经理办公室': 'gold' }

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>组织管理与业务流程</Title>
        <Text type="secondary">组织架构 · 部门职责 · 业务流程可视化 · 数字员工分布</Text>
      </div>

      <Row gutter={[16, 16]}>
        {/* 组织架构 */}
        <Col xs={24} lg={12}>
          <Card title={<><TeamOutlined /> 组织架构</>} style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {depts.map(d => (
                <div key={d.id} style={{ padding: '10px 12px', background: '#fafafa', borderRadius: 8, borderLeft: `4px solid ${deptMap[d.name] || '#d9d9d9'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>{d.name}</Text>
                    <Tag color={deptMap[d.name] || 'default'} style={{ fontSize: 11 }}>{d.headcount}人</Tag>
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                    {d.manager ? `负责人：${d.manager}` : '——'}
                  </div>
                  <div style={{ fontSize: 11, color: '#bfbfbf' }}>{d.description}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title={<><DatabaseOutlined /> 系统模块权限</>} style={{ borderRadius: 12, marginTop: 16 }}>
            <Table
              dataSource={[
                { module: '管理驾驶舱', page: 'dashboard', roles: 'admin/manager/staff/guest' },
                { module: '项目管理', page: 'projects', roles: 'admin/manager/staff' },
                { module: '检测业务', page: 'inspections', roles: 'admin/manager/staff' },
                { module: '人力资源', page: 'hr', roles: 'admin/manager' },
                { module: '财务管理', page: 'finance', roles: 'admin/manager' },
                { module: '预算管理', page: 'budget', roles: 'admin/manager/staff' },
                { module: '设备管理', page: 'equipment', roles: 'admin/manager/staff' },
                { module: '客户管理', page: 'customers', roles: 'admin/manager/staff' },
                { module: '合规风控', page: 'compliance', roles: 'admin/manager/staff/guest' },
                { module: '知识管理', page: 'knowledge', roles: 'admin/manager/staff/guest' },
                { module: '数字员工', page: 'agents', roles: 'admin/manager/staff/guest' },
                { module: '合同管理', page: 'contracts', roles: 'admin/manager/staff' },
                { module: '检测报告', page: 'reports', roles: 'admin/manager/staff' },
                { module: '贸易管理', page: 'trade', roles: 'admin/manager/staff' },
                { module: '材料管理', page: 'materials', roles: 'admin/manager/staff' },
                { module: '采购管理', page: 'procurement', roles: 'admin/manager/staff' },
                { module: '制度管理', page: 'policies', roles: 'admin/manager' },
                { module: '资质管理', page: 'qualifications', roles: 'admin/manager' },
                { module: '培训管理', page: 'training', roles: 'admin/manager' },
                { module: '组织架构', page: 'organization', roles: 'admin' },
                { module: '系统设置', page: 'settings', roles: 'admin' },
              ]}
              rowKey="module"
              pagination={false}
              size="small"
              columns={[
                { title: '模块', dataIndex: 'module', width: 120 },
                { title: '权限范围', dataIndex: 'roles', render: v => v.split('/').map(r => (
                  <Tag key={r} color={r === 'admin' ? 'gold' : r === 'manager' ? 'orange' : r === 'staff' ? 'blue' : 'default'} style={{ fontSize: 10, marginRight: 2 }}>{r}</Tag>
                ))},
              ]}
            />
          </Card>
        </Col>

        {/* 业务流程 */}
        <Col xs={24} lg={12}>
          <Card title={<><SettingOutlined /> 业务流程库</>} style={{ borderRadius: 12, marginBottom: 16 }}>
            {processes.map(p => (
              <div key={p.id} onClick={() => handleProcessClick(p)} style={{
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: selectedProcess?.id === p.id ? '#e6f7ff' : '#fafafa',
                border: selectedProcess?.id === p.id ? '1px solid #1890ff' : '1px solid #f0f0f0',
                marginBottom: 8, transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                  <Tag color="blue" style={{ fontSize: 11 }}>{p.step_count}步 · SLA {p.sla_hours}h</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>{p.description}</Text>
              </div>
            ))}
          </Card>

          {selectedProcess && (
            <Card title={<><FileTextOutlined /> {selectedProcess.name} — 流程步骤</>} style={{ borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {steps.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: '#1890ff', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 2
                    }}>{s.step_num}</div>
                    <div style={{ flex: 1, paddingBottom: 12, borderBottom: i < steps.length - 1 ? '1px dashed #f0f0f0' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong style={{ fontSize: 13 }}>{s.name}</Text>
                        <Tag color="purple" style={{ fontSize: 10 }}>{s.owner_role}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>SLA: {s.sla_hours}h | 输入: {s.input_req} | 输出: {s.output_req}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title={<><RobotOutlined /> 数字员工覆盖</>} style={{ borderRadius: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { name: '智客', role: '客服顾问', avatar: '🤖', domain: '业务承接' },
                { name: '智项', role: '项目经理', avatar: '📋', domain: '项目实施' },
                { name: '智检', role: '质检主管', avatar: '🔬', domain: '质量管控' },
                { name: '智安', role: '安全主管', avatar: '🛡️', domain: '安全管理' },
                { name: '智测', role: '消防检测', avatar: '🧯', domain: '消防检测' },
                { name: '智洁', role: '洁净检测', avatar: '🏥', domain: '洁净检测' },
                { name: '智商', role: '贸易主管', avatar: '💼', domain: '贸易业务' },
                { name: '智报', role: '报告顾问', avatar: '📄', domain: '报告管理' },
              ].map(a => (
                <div key={a.name} style={{ padding: '8px 10px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                  <Space>
                    <span style={{ fontSize: 18 }}>{a.avatar}</span>
                    <div>
                      <Text strong style={{ fontSize: 12 }}>{a.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 10 }}>{a.role}</Text>
                    </div>
                    <Tag color="green" style={{ fontSize: 10, marginLeft: 'auto' }}>{a.domain}</Tag>
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
