import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EditOutlined, SendOutlined } from '@ant-design/icons'
import { Tag } from 'antd'

const statusStyles: Record<string, { color: string; icon: React.ReactNode }> = {
  DRAFT: { color: 'gold', icon: <EditOutlined /> },
  SUBMITTED: { color: 'blue', icon: <SendOutlined /> },
  DISTRIBUTED: { color: 'green', icon: <CheckCircleOutlined /> },
  PENDING: { color: 'gold', icon: <ClockCircleOutlined /> },
  LIVE: { color: 'green', icon: <CheckCircleOutlined /> },
  REJECTED: { color: 'red', icon: <CloseCircleOutlined /> },
  ARCHIVED: { color: 'default', icon: <ClockCircleOutlined /> },
}

export function StatusTag({ code, label }: { code: string; label: string }) {
  const style = statusStyles[code.toUpperCase()] ?? statusStyles.ARCHIVED
  return (
    <Tag color={style.color} icon={style.icon} className="status-tag">
      {label}
    </Tag>
  )
}
