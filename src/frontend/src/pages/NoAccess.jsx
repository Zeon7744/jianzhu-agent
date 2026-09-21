import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NoAccess() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        status="403"
        title="权限不足"
        subTitle="您没有权限访问此页面，请联系管理员申请相应角色权限。"
        extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回首页</Button>}
      />
    </div>
  )
}
