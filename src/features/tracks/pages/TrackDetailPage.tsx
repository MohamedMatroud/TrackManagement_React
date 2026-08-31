import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  ReloadOutlined,
  SendOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Modal,
  Result,
  Select,
  Skeleton,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
  type TableColumnsType,
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { dspClient } from '../../dsps/api/DspClient'
import type { Dsp } from '../../dsps/types'
import { lookupClient } from '../../lookups/api/LookupClient'
import type { LookupItem } from '../../lookups/types'
import { StatusTag } from '../../../shared/components/StatusTag'
import { useAsyncResource } from '../../../shared/hooks/useAsyncResource'
import { errorMessage } from '../../../shared/lib/errors'
import { formatDate, formatDateTime, formatDuration, localizedName } from '../../../shared/lib/formatters'
import type { AppLanguage } from '../../../shared/lib/preferences'
import { trackClient } from '../api/TrackClient'
import type { Track, TrackDistribution } from '../types'

const { Title, Text } = Typography
const WORKFLOW = ['DRAFT', 'SUBMITTED', 'DISTRIBUTED'] as const

interface DetailLocationState {
  from?: string
}

interface DistributeFormValues {
  dspIds: string[]
}

interface DetailData {
  track: Track
  statuses: LookupItem[]
  dsps: Dsp[]
}

export function TrackDetailPage() {
  const { t, i18n } = useTranslation()
  const language = (i18n.resolvedLanguage === 'ar' ? 'ar' : 'en') as AppLanguage
  const { message, modal } = AntdApp.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { trackId } = useParams()
  const id = Number(trackId)
  const [distributionOpen, setDistributionOpen] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [distributionBusy, setDistributionBusy] = useState(false)
  const [distributionForm] = Form.useForm<DistributeFormValues>()

  const resource = useAsyncResource<DetailData>(
    async (signal) => {
      const [track, statuses, dsps] = await Promise.all([
        trackClient.getById(id, signal),
        lookupClient.trackStatuses(signal),
        dspClient.list(signal),
      ])
      return { track, statuses, dsps }
    },
    [id],
  )

  useEffect(() => {
    document.title = resource.data
      ? `${resource.data.track.title} | ${t('common.productName')}`
      : `${t('detail.eyebrow')} | ${t('common.productName')}`
  }, [resource.data, t, i18n.resolvedLanguage])

  const backDestination = (location.state as DetailLocationState | null)?.from || '/tracks'

  if (!Number.isInteger(id) || id <= 0) {
    return <Result status="404" title="404" subTitle={t('errors.trackNotFound')} extra={<Button onClick={() => navigate('/tracks')}>{t('common.backToTracks')}</Button>} />
  }

  if (resource.loading && !resource.data) {
    return <div className="page-stack"><Skeleton active paragraph={{ rows: 3 }} /><Card className="app-surface"><Skeleton active paragraph={{ rows: 10 }} /></Card></div>
  }

  if (resource.error && !resource.data) {
    return (
      <div className="centered-state">
        <Alert
          type="error"
          showIcon
          message={t('errors.loadTrack')}
          description={errorMessage(resource.error, t)}
          action={<Button icon={<ReloadOutlined />} onClick={resource.refresh}>{t('common.retry')}</Button>}
        />
      </div>
    )
  }

  if (!resource.data) return null

  const { track, statuses, dsps } = resource.data
  const currentStatusIndex = Math.max(0, WORKFLOW.indexOf(track.trackStatusCode as (typeof WORKFLOW)[number]))
  const nextCode = track.trackStatusCode === 'DRAFT' ? 'SUBMITTED' : track.trackStatusCode === 'SUBMITTED' ? 'DISTRIBUTED' : null
  const nextStatus = nextCode ? statuses.find((status) => status.code === nextCode) : undefined
  const assignedDspIds = new Set(track.distributions.map((distribution) => distribution.dspId))
  const availableDsps = dsps.filter((dsp) => !assignedDspIds.has(dsp.id))

  const confirmStatusUpdate = () => {
    if (!nextStatus) return
    modal.confirm({
      title: t('detail.statusConfirmTitle'),
      content: t('detail.statusConfirmBody', { status: localizedName(nextStatus, language) }),
      okText: t('detail.statusConfirmAction'),
      cancelText: t('common.cancel'),
      centered: true,
      onOk: async () => {
        setStatusBusy(true)
        try {
          await trackClient.updateStatus(track.id, { trackStatusId: nextStatus.id })
          message.success(t('detail.statusSuccess'))
          resource.refresh()
        } catch (error) {
          message.error(errorMessage(error, t))
          throw error
        } finally {
          setStatusBusy(false)
        }
      },
    })
  }

  const submitDistribution = async ({ dspIds }: DistributeFormValues) => {
    setDistributionBusy(true)
    try {
      const created = await trackClient.distribute(track.id, { dspIds })
      message.success(t('detail.distributionSuccess', { count: created.length }))
      setDistributionOpen(false)
      distributionForm.resetFields()
      resource.refresh()
    } catch (error) {
      message.error(errorMessage(error, t))
    } finally {
      setDistributionBusy(false)
    }
  }

  const distributionColumns: TableColumnsType<TrackDistribution> = [
    {
      title: t('detail.columns.destination'),
      key: 'dsp',
      render: (_, distribution) => (
        <div className="destination-cell">
          <span className="destination-icon"><GlobalOutlined /></span>
          <span><strong>{language === 'ar' ? distribution.dspNameAr : distribution.dspNameEn}</strong><small>{distribution.dspCode}</small></span>
        </div>
      ),
    },
    {
      title: t('detail.columns.submitted'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (value: string) => formatDateTime(value, language),
    },
    {
      title: t('detail.columns.status'),
      key: 'status',
      render: (_, distribution) => (
        <StatusTag
          code={distribution.statusCode}
          label={language === 'ar' ? distribution.statusNameAr : distribution.statusNameEn}
        />
      ),
    },
  ]

  return (
    <div className="page-stack">
      <Button type="text" className="back-button" icon={<ArrowLeftOutlined className="rtl-flip" />} onClick={() => navigate(backDestination)}>
        {t('common.backToTracks')}
      </Button>

      {resource.error && <Alert type="warning" showIcon message={errorMessage(resource.error, t)} />}

      <section className="detail-hero app-surface">
        <div className="detail-title-block">
          <span className="detail-cover" aria-hidden="true"><SoundOutlined /></span>
          <div>
            <Space size="small" wrap>
              <Text className="eyebrow">{t('detail.eyebrow')}</Text>
              <StatusTag
                code={track.trackStatusCode}
                label={language === 'ar' ? track.trackStatusNameAr : track.trackStatusNameEn}
              />
            </Space>
            <Title level={1}>{track.title}</Title>
            <Text type="secondary">{track.artistName} · {track.isrc}</Text>
          </div>
        </div>
        <Space wrap>
          {nextStatus && (
            <Button type="primary" icon={<SendOutlined />} loading={statusBusy} onClick={confirmStatusUpdate}>
              {t('detail.moveTo', { status: localizedName(nextStatus, language) })}
            </Button>
          )}
          {track.trackStatusCode === 'DISTRIBUTED' && availableDsps.length > 0 && (
            <Button icon={<CloudUploadOutlined />} onClick={() => setDistributionOpen(true)}>
              {t('detail.addDestinations')}
            </Button>
          )}
        </Space>
      </section>

      <section className="detail-grid">
        <Card className="app-surface workflow-card" variant="borderless" title={t('detail.releaseWorkflow')}>
          <Steps
            current={currentStatusIndex}
            items={[
              { title: t('status.DRAFT'), icon: <SoundOutlined /> },
              { title: t('status.SUBMITTED'), icon: <SendOutlined /> },
              { title: t('status.DISTRIBUTED'), icon: <CheckCircleOutlined /> },
            ]}
          />
          <Text type="secondary" className="!mt-6 !block">{t('detail.workflowHint')}</Text>
        </Card>

        <Card className="app-surface" variant="borderless" title={t('detail.trackInformation')}>
          <Descriptions column={1} size="small" colon={false}>
            <Descriptions.Item label={<span><CustomerServiceOutlined /> {t('tracks.fields.artist')}</span>}>{track.artistName}</Descriptions.Item>
            <Descriptions.Item label={<span><SoundOutlined /> {t('tracks.fields.album')}</span>}>{track.album || '—'}</Descriptions.Item>
            <Descriptions.Item label={<span><GlobalOutlined /> {t('tracks.fields.genre')}</span>}>{track.genre || '—'}</Descriptions.Item>
            <Descriptions.Item label={<span><ClockCircleOutlined /> {t('tracks.fields.duration')}</span>}>{formatDuration(track.durationSeconds, language)}</Descriptions.Item>
            <Descriptions.Item label={<span><CalendarOutlined /> {t('tracks.fields.releaseDate')}</span>}>{formatDate(track.releaseDate, language)}</Descriptions.Item>
          </Descriptions>
        </Card>
      </section>

      <Card
        className="app-surface distribution-card"
        variant="borderless"
        title={
          <div>
            <Title level={4} className="!mb-1">{t('detail.distributionTitle')}</Title>
            <Text type="secondary">{t('detail.distributionSubtitle')}</Text>
          </div>
        }
        extra={track.distributions.length > 0 ? <Tag>{t('detail.destinationCount', { count: track.distributions.length })}</Tag> : undefined}
      >
        {track.distributions.length > 0 ? (
          <Table<TrackDistribution>
            rowKey="id"
            columns={distributionColumns}
            dataSource={track.distributions}
            pagination={false}
            scroll={{ x: 620 }}
          />
        ) : (
          <Empty description={t('detail.noDistributions')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            {track.trackStatusCode === 'DISTRIBUTED' && availableDsps.length > 0 && (
              <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => setDistributionOpen(true)}>
                {t('detail.addDestinations')}
              </Button>
            )}
          </Empty>
        )}
      </Card>

      <Modal
        open={distributionOpen}
        title={t('detail.distributionModalTitle')}
        okText={t('detail.distributionModalAction')}
        cancelText={t('common.cancel')}
        confirmLoading={distributionBusy}
        onOk={() => distributionForm.submit()}
        onCancel={() => {
          setDistributionOpen(false)
          distributionForm.resetFields()
        }}
        centered
      >
        <Text type="secondary">{t('detail.distributionModalSubtitle')}</Text>
        <Form<DistributeFormValues> form={distributionForm} layout="vertical" requiredMark={false} onFinish={submitDistribution} className="!mt-6">
          <Form.Item name="dspIds" label={t('detail.chooseDestinations')} rules={[{ required: true, message: t('detail.chooseDestinationError') }]}>
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              placeholder={t('detail.chooseDestinationPlaceholder')}
              options={availableDsps.map((dsp) => ({ value: dsp.id, label: localizedName(dsp, language) }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
