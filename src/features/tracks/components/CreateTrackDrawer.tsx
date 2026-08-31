import { CalendarOutlined, ClockCircleOutlined, CustomerServiceOutlined, SoundOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, DatePicker, Drawer, Form, Input, InputNumber, Select, Space, Typography } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Artist } from '../../artists/types'
import { errorMessage } from '../../../shared/lib/errors'
import { trackClient } from '../api/TrackClient'
import type { Track } from '../types'

const { Title, Text } = Typography

interface TrackFormValues {
  title: string
  artistId: number
  isrc: string
  album?: string
  genre?: string
  durationSeconds: number
  releaseDate: Dayjs
}

interface CreateTrackDrawerProps {
  open: boolean
  artists: Artist[]
  onClose: () => void
  onCreated: (track: Track) => void
}

export function CreateTrackDrawer({ open, artists, onClose, onCreated }: CreateTrackDrawerProps) {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<TrackFormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ releaseDate: dayjs().startOf('day') })
    } else {
      form.resetFields()
    }
  }, [form, open])

  const onFinish = async (values: TrackFormValues) => {
    setSubmitting(true)
    try {
      const track = await trackClient.create({
        title: values.title.trim(),
        artistId: values.artistId,
        isrc: values.isrc.trim().toUpperCase(),
        album: values.album?.trim() || null,
        genre: values.genre?.trim() || null,
        durationSeconds: values.durationSeconds,
        releaseDate: values.releaseDate.startOf('day').toISOString(),
      })
      message.success(t('tracks.createSuccess'))
      onCreated(track)
    } catch (error) {
      message.error(errorMessage(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={540}
      destroyOnHidden
      forceRender
      title={
        <div>
          <Title level={4} className="!mb-1">{t('tracks.createTitle')}</Title>
          <Text type="secondary">{t('tracks.createSubtitle')}</Text>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="primary" loading={submitting} onClick={() => form.submit()}>
            {t('tracks.createAction')}
          </Button>
        </div>
      }
    >
      <Form<TrackFormValues> form={form} layout="vertical" requiredMark={false} onFinish={onFinish}>
        <Form.Item
          name="title"
          label={t('tracks.fields.title')}
          rules={[
            { required: true, whitespace: true, message: t('tracks.validation.titleRequired') },
            { max: 200, message: t('tracks.validation.titleMax') },
          ]}
        >
          <Input prefix={<SoundOutlined />} placeholder={t('tracks.placeholders.title')} maxLength={200} showCount />
        </Form.Item>

        <Form.Item
          name="artistId"
          label={t('tracks.fields.artist')}
          rules={[{ required: true, message: t('tracks.validation.artistRequired') }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder={t('tracks.placeholders.artist')}
            suffixIcon={<CustomerServiceOutlined />}
            options={artists.map((artist) => ({ value: artist.id, label: artist.name }))}
          />
        </Form.Item>

        <Form.Item
          name="isrc"
          label={t('tracks.fields.isrc')}
          extra={t('tracks.hints.isrc')}
          normalize={(value: string) => value.toUpperCase()}
          rules={[
            { required: true, whitespace: true, message: t('tracks.validation.isrcRequired') },
            { pattern: /^[A-Za-z]{2}[A-Za-z0-9]{3}[0-9]{7}$/, message: t('tracks.validation.isrcInvalid') },
          ]}
        >
          <Input placeholder="EGAAA2600001" maxLength={12} />
        </Form.Item>

        <div className="form-grid-two">
          <Form.Item name="album" label={t('tracks.fields.album')} rules={[{ max: 200 }]}>
            <Input placeholder={t('tracks.placeholders.album')} maxLength={200} />
          </Form.Item>
          <Form.Item name="genre" label={t('tracks.fields.genre')} rules={[{ max: 100 }]}>
            <Input placeholder={t('tracks.placeholders.genre')} maxLength={100} />
          </Form.Item>
        </div>

        <div className="form-grid-two">
          <Form.Item
            name="durationSeconds"
            label={t('tracks.fields.duration')}
            rules={[
              { required: true, message: t('tracks.validation.durationRequired') },
              { type: 'number', min: 1, message: t('tracks.validation.durationPositive') },
            ]}
          >
            <InputNumber
              min={1}
              precision={0}
              className="!w-full"
              placeholder={t('tracks.placeholders.duration')}
              prefix={<ClockCircleOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="releaseDate"
            label={t('tracks.fields.releaseDate')}
            rules={[{ required: true, message: t('tracks.validation.releaseRequired') }]}
          >
            <DatePicker
              className="!w-full"
              suffixIcon={<CalendarOutlined />}
              disabledDate={(current) => current.isAfter(dayjs(), 'day')}
            />
          </Form.Item>
        </div>

        <div className="drawer-note">
          <Space align="start">
            <span className="drawer-note-icon"><SoundOutlined /></span>
            <span>
              <strong>{t('tracks.draftNoteTitle')}</strong>
              <Text type="secondary" className="!block">{t('tracks.draftNote')}</Text>
            </span>
          </Space>
        </div>
      </Form>
    </Drawer>
  )
}
