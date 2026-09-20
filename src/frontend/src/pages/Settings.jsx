import { useState } from 'react'
import {
  Row, Col, Card, Form, Input, Select, Switch, Button, Space, Typography,
  Divider, Alert, message, Tabs, Radio, Slider
} from 'antd'
import {
  SettingOutlined, SaveOutlined, ReloadOutlined, CloudOutlined,
  DatabaseOutlined, KeyOutlined, TeamOutlined, BellOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export default function Settings() {
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const handleSave = async () => {
    try {
      await form.validateFields()
      setSaving(true)
      setTimeout(() => {
        setSaving(false)
        message.success('设置已保存')
      }, 1000)
    } catch {}
  }

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>系统设置</Title>
          <Text type="secondary">基础配置 · 权限管理 · 系统参数</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />}>重置</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>保存设置</Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="basic" items={[
        {
          key: 'basic', label: '基础设置', icon: <SettingOutlined />,
          children: (
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Card title="公司信息" style={{ borderRadius: 12 }}>
                  <Form form={form} layout="vertical">
                    <Form.Item name="companyName" label="公司名称">
                      <Input defaultValue="中建检测咨询有限公司" />
                    </Form.Item>
                    <Form.Item name="license" label="资质证书编号">
                      <Input defaultValue="CMA-2024-001234" />
                    </Form.Item>
                    <Form.Item name="address" label="公司地址">
                      <Input defaultValue="北京市朝阳区科技园区A座18层" />
                    </Form.Item>
                    <Form.Item name="phone" label="联系电话">
                      <Input defaultValue="010-88888888" />
                    </Form.Item>
                    <Form.Item name="email" label="官方邮箱">
                      <Input defaultValue="info@jianjian.com" />
                    </Form.Item>
                  </Form>
                </Card>

                <Card title="系统参数" style={{ borderRadius: 12, marginTop: 16 }}>
                  <Form layout="vertical">
                    <Form.Item label="数据保留期限">
                      <Select defaultValue={36} options={[
                        { value: 12, label: '1年' },
                        { value: 24, label: '2年' },
                        { value: 36, label: '3年' },
                        { value: 60, label: '5年' },
                        { value: 0, label: '永久' }
                      ]} />
                    </Form.Item>
                    <Form.Item label="自动备份频率">
                      <Radio.Group defaultValue="daily">
                        <Radio value="hourly">每小时</Radio>
                        <Radio value="daily">每天</Radio>
                        <Radio value="weekly">每周</Radio>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item label="登录超时时间(分钟)">
                      <Slider min={5} max={60} defaultValue={30} />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="系统信息" style={{ borderRadius: 12 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div><Text type="secondary">系统版本</Text><br /><Text strong>v1.0.0</Text></div>
                    <div><Text type="secondary">数据库</Text><br /><Text strong>SQLite</Text> <Text type="secondary">(可扩展至PostgreSQL)</Text></div>
                    <div><Text type="secondary">部署方式</Text><br /><Text strong>本地运行</Text></div>
                    <div><Text type="secondary">运行环境</Text><br /><Text strong>Node.js 18+</Text></div>
                    <Divider />
                    <div><Text type="secondary">许可证</Text><br /><Text>企业版 · 永久授权</Text></div>
                    <div><Text type="secondary">技术支持</Text><br /><Text>support@sapiens.ai</Text></div>
                  </Space>
                </Card>

                <Card title="快捷操作" style={{ borderRadius: 12, marginTop: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block icon={<DatabaseOutlined />}>数据备份</Button>
                    <Button block icon={<CloudOutlined />}>数据迁移</Button>
                    <Button block icon={<KeyOutlined />}>修改密码</Button>
                    <Button block icon={<TeamOutlined />}>用户管理</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'notify', label: '通知设置', icon: <BellOutlined />,
          children: (
            <Card style={{ borderRadius: 12 }}>
              <Alert message="通知设置控制各模块的提醒和推送规则" type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
              <Form layout="vertical">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                      <div><Text strong>项目进度预警</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>项目接近截止日期时提醒</Text></div>
                      <Switch defaultChecked />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                      <div><Text strong>设备检定到期提醒</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>设备检定前30天自动提醒</Text></div>
                      <Switch defaultChecked />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                      <div><Text strong>资质证书到期提醒</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>人员证书到期前提醒续期</Text></div>
                      <Switch defaultChecked />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                      <div><Text strong>应收账款提醒</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>到期未收款自动提醒</Text></div>
                      <Switch defaultChecked />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                      <div><Text strong>数字员工任务完成</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>重要任务完成后通知</Text></div>
                      <Switch defaultChecked />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
                      <div><Text strong>每日经营简报</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>每日自动推送经营概览</Text></div>
                      <Switch defaultChecked />
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card>
          )
        },
        {
          key: 'security', label: '安全设置', icon: <KeyOutlined />,
          children: (
            <Card style={{ borderRadius: 12 }}>
              <Alert message="安全设置用于保护系统数据和用户信息安全" type="warning" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
              <Form layout="vertical">
                <Form.Item label="密码复杂度要求">
                  <Select defaultValue="medium" options={[
                    { value: 'low', label: '低（6位以上）' },
                    { value: 'medium', label: '中（8位+字母数字组合）' },
                    { value: 'high', label: '高（10位+字母数字符号）' }
                  ]} />
                </Form.Item>
                <Form.Item label="登录失败锁定阈值">
                  <Select defaultValue={5} options={[{ value: 3, label: '3次' }, { value: 5, label: '5次' }, { value: 10, label: '10次' }]} />
                </Form.Item>
                <Form.Item label="会话超时时间(分钟)">
                  <Slider min={5} max={120} defaultValue={30} />
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#f6ffed', borderRadius: 8, marginTop: 8 }}>
                  <div><Text strong>双因素认证</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>登录时需要手机验证码二次确认</Text></div>
                  <Switch />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#f6ffed', borderRadius: 8, marginTop: 8 }}>
                  <div><Text strong>操作日志审计</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>记录所有用户操作行为</Text></div>
                  <Switch defaultChecked />
                </div>
              </Form>
            </Card>
          )
        }
      ]} />
    </div>
  )
}
