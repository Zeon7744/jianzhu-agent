import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd'
import { UserOutlined, LockOutlined, RobotOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const ROLES = {
  admin:   { label: '总经理', color: '#cf1322', bg: '#fff1f0', icon: '👑' },
  manager: { label: '部门主管', color: '#d4380d', bg: '#fff7e6', icon: '📋' },
  staff:   { label: '普通员工', color: '#fa8c16', bg: '#fffbe6', icon: '👤' },
  guest:   { label: '访客', color: '#52c41a', bg: '#f6ffed', icon: '👁️' },
}

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || '登录失败')
      onLogin(data)
      message.success(`欢迎，${data.user.name}！`)
    } catch (e) {
      message.error(e.message || '登录失败，请检查用户名密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}>
      {/* 左侧品牌区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, color: '#fff' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🏗️</div>
        <Title level={1} style={{ color: '#fff', fontSize: 42, marginBottom: 16, fontWeight: 700 }}>建检智管</Title>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 40 }}>建筑行业检测及信息咨询公司 AI企业应用系统</Text>
        
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(ROLES).map(([key, val]) => (
            <div key={key} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 24px', textAlign: 'center', backdropFilter: 'blur(10px)', minWidth: 100 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{val.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{val.label}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{key}</div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 48, opacity: 0.5, fontSize: 12 }}>
          <p>演示账号：</p>
          <p>admin/admin123 &nbsp;|&nbsp; manager/mgr12345 &nbsp;|&nbsp; staff01/staff123 &nbsp;|&nbsp; guest/guest123</p>
        </div>
      </div>

      {/* 右侧登录卡片 */}
      <div style={{ width: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: '85%' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <RobotOutlined style={{ fontSize: 36, color: '#1890ff' }} />
            <Title level={3} style={{ marginTop: 8, marginBottom: 4 }}>系统登录</Title>
            <Text type="secondary">请输入您的账号信息</Text>
          </div>
          
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="请输入用户名" size="large" />
            </Form.Item>
            
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="请输入密码" size="large" />
            </Form.Item>
            
            <Form.Item style={{ marginBottom: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading} size="large" block
                style={{ borderRadius: 8, height: 44, fontSize: 16, background: '#1890ff', border: 'none' }}>
                登 录
              </Button>
            </Form.Item>
          </Form>
          
          <Divider style={{ margin: '0 0 16px' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { user: 'admin', pass: 'admin123', label: '总经理', desc: '全部权限' },
              { user: 'guest', pass: 'guest123', label: '访客', desc: '只读浏览' },
            ].map((demo) => (
              <div key={demo.user} 
                onClick={() => form.setFieldsValue({ username: demo.user, password: demo.pass })}
                style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: '#f6f8fa', border: '1px solid #e8e8e8', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e6f7ff'; e.currentTarget.style.borderColor = '#1890ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f6f8fa'; e.currentTarget.style.borderColor = '#e8e8e8' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{demo.label}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{demo.user} / {demo.pass}</div>
                <div style={{ fontSize: 10, color: '#1890ff' }}>{demo.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
