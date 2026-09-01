import {
  ArrowRightOutlined,
  CustomerServiceOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Empty,
  Input,
  Pagination,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Typography,
  type TableColumnsType,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { artistClient } from '../../artists/api/ArtistClient'
import type { Artist } from '../../artists/types'
import { distributionClient } from '../../distributions/api/DistributionClient'
import { StatusTag } from '../../../shared/components/StatusTag'
import { useAsyncResource } from '../../../shared/hooks/useAsyncResource'
import { errorMessage } from '../../../shared/lib/errors'
import { formatDate, formatNumber } from '../../../shared/lib/formatters'
import type { AppLanguage } from '../../../shared/lib/preferences'
import { trackClient } from '../api/TrackClient'
import { CreateTrackDrawer } from '../components/CreateTrackDrawer'
import type { Track, TrackQuery } from '../types'

const { Title, Text } = Typography
const WORKFLOW_STATUSES = ['DRAFT', 'SUBMITTED', 'DISTRIBUTED'] as const

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function TrackListPage() {
  const { t, i18n } = useTranslation()
  const language = (i18n.resolvedLanguage === 'ar' ? 'ar' : 'en') as AppLanguage
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') ?? '')
  const [genreDraft, setGenreDraft] = useState(searchParams.get('genre') ?? '')
  const [createOpen, setCreateOpen] = useState(false)

  const query: TrackQuery = useMemo(
    () => ({
      pageNumber: positiveInteger(searchParams.get('page'), 1),
      pageSize: positiveInteger(searchParams.get('pageSize'), 10),
      search: searchParams.get('search') || undefined,
      artistId: searchParams.get('artistId') ? positiveInteger(searchParams.get('artistId'), 0) || undefined : undefined,
      genre: searchParams.get('genre') || undefined,
      status: searchParams.get('status') || undefined,
    }),
    [searchParams],
  )

  const tracksResource = useAsyncResource(
    (signal) => trackClient.list(query, signal),
    [query.pageNumber, query.pageSize, query.search, query.artistId, query.genre, query.status],
  )
  const artistsResource = useAsyncResource((signal) => artistClient.list(signal), [])
  const assignmentCountResource = useAsyncResource((signal) => distributionClient.count(signal), [])

  // Local drafts mirror URL history changes without applying every keystroke as a request.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setSearchDraft(query.search ?? ''), [query.search])
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setGenreDraft(query.genre ?? ''), [query.genre])
  useEffect(() => {
    document.title = `${t('tracks.title')} | ${t('common.productName')}`
  }, [t, i18n.resolvedLanguage])

  const setFilter = (key: string, value?: string | number) => {
    const next = new URLSearchParams(searchParams)
    if (value === undefined || value === '') next.delete(key)
    else next.set(key, String(value))
    if (key !== 'page') next.set('page', '1')
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    setSearchDraft('')
    setGenreDraft('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const openTrack = (track: Track) => {
    navigate(`/tracks/${track.id}`, { state: { from: location.pathname + location.search } })
  }

  const statusName = (track: Track) =>
    language === 'ar' ? track.trackStatusNameAr : track.trackStatusNameEn

  const columns: TableColumnsType<Track> = [
    {
      title: t('tracks.columns.track'),
      key: 'track',
      width: 420,
      render: (_, track) => (
        <div className="track-cell">
          <span className="track-icon"><SoundOutlined /></span>
          <span>
            <strong title={track.title}>{track.title}</strong>
            <small>{track.isrc}</small>
          </span>
        </div>
      ),
    },
    { title: t('tracks.columns.artist'), dataIndex: 'artistName', key: 'artistName' },
    {
      title: t('tracks.columns.genre'),
      dataIndex: 'genre',
      key: 'genre',
      render: (genre: string | null) => genre || <Text type="secondary">—</Text>,
    },
    {
      title: t('tracks.columns.release'),
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (value: string) => formatDate(value, language),
    },
    {
      title: t('tracks.columns.status'),
      key: 'status',
      render: (_, track) => <StatusTag code={track.trackStatusCode} label={statusName(track)} />,
    },
    {
      title: t('tracks.columns.dsps'),
      key: 'dsps',
      align: 'center',
      render: (_, track) => <span className="count-pill">{formatNumber(track.dspAssignmentsCount, language)}</span>,
    },
    {
      title: '',
      key: 'action',
      width: 56,
      render: (_, track) => (
        <Button
          type="text"
          aria-label={t('tracks.openTrack', { title: track.title })}
          icon={<ArrowRightOutlined className="rtl-flip" />}
          onClick={(event) => {
            event.stopPropagation()
            openTrack(track)
          }}
        />
      ),
    },
  ]

  const data = tracksResource.data
  const activeFilterCount = [query.search, query.artistId, query.genre, query.status].filter(Boolean).length
  const visibleAssignments = data?.items.reduce((total, track) => total + track.dspAssignmentsCount, 0) ?? 0
  const assignedDestinations = assignmentCountResource.data?.count ?? visibleAssignments

  if (tracksResource.loading && !data) {
    return (
      <div className="page-stack">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Card className="app-surface"><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </div>
    )
  }

  if (tracksResource.error && !data) {
    return (
      <div className="centered-state">
        <Alert
          type="error"
          showIcon
          message={t('errors.loadTracks')}
          description={errorMessage(tracksResource.error, t)}
          action={<Button icon={<ReloadOutlined />} onClick={tracksResource.refresh}>{t('common.retry')}</Button>}
        />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <Text className="eyebrow">{t('tracks.eyebrow')}</Text>
          <Title level={1}>{t('tracks.title')}</Title>
          <Text type="secondary">{t('tracks.subtitle')}</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateOpen(true)}>
          {t('tracks.createAction')}
        </Button>
      </section>

      <section className="stats-grid" aria-label={t('tracks.overview')}>
        <Card className="metric-card app-surface" variant="borderless">
          <Statistic title={t('tracks.metrics.catalog')} value={data?.totalCount ?? 0} />
        </Card>
        <Card className="metric-card app-surface" variant="borderless">
          <Statistic title={t('tracks.metrics.visible')} value={data?.items.length ?? 0} />
        </Card>
        <Card className="metric-card app-surface" variant="borderless">
          <Statistic title={t('tracks.metrics.assignments')} value={assignedDestinations} />
        </Card>
      </section>

      <Card className="filter-card app-surface" variant="borderless">
        <div className="filter-toolbar">
          <Input.Search
            value={searchDraft}
            allowClear
            prefix={<SearchOutlined />}
            placeholder={t('tracks.filters.search')}
            onChange={(event) => {
              setSearchDraft(event.target.value)
              if (!event.target.value) setFilter('search')
            }}
            onSearch={(value) => setFilter('search', value.trim())}
          />
          <Select
            allowClear
            value={query.status}
            placeholder={t('tracks.filters.status')}
            suffixIcon={<FilterOutlined />}
            onChange={(value) => setFilter('status', value)}
            options={WORKFLOW_STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) }))}
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            value={query.artistId}
            loading={artistsResource.loading}
            placeholder={t('tracks.filters.artist')}
            suffixIcon={<CustomerServiceOutlined />}
            onChange={(value) => setFilter('artistId', value)}
            options={(artistsResource.data ?? []).map((artist) => ({ value: artist.id, label: artist.name }))}
          />
          <Input.Search
            value={genreDraft}
            allowClear
            placeholder={t('tracks.filters.genre')}
            onChange={(event) => {
              setGenreDraft(event.target.value)
              if (!event.target.value) setFilter('genre')
            }}
            onSearch={(value) => setFilter('genre', value.trim())}
          />
          {activeFilterCount > 0 && <Button onClick={clearFilters}>{t('common.clearFilters')}</Button>}
        </div>
      </Card>

      {tracksResource.error && data && (
        <Alert type="warning" showIcon message={errorMessage(tracksResource.error, t)} />
      )}

      <Card className="catalog-card app-surface" variant="borderless">
        {data && data.items.length > 0 ? (
          <>
            <div className="desktop-track-table">
              <Table<Track>
                rowKey="id"
                tableLayout="fixed"
                columns={columns}
                dataSource={data.items}
                loading={tracksResource.refreshing}
                pagination={{
                  current: data.pageNumber,
                  pageSize: data.pageSize,
                  total: data.totalCount,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50],
                  showTotal: (total) => t('tracks.paginationTotal', { total: formatNumber(total, language) }),
                  onChange: (page, pageSize) => {
                    const next = new URLSearchParams(searchParams)
                    next.set('page', String(page))
                    next.set('pageSize', String(pageSize))
                    setSearchParams(next, { replace: true })
                  },
                }}
                onRow={(track) => ({ onClick: () => openTrack(track), className: 'clickable-row' })}
              />
            </div>

            <div className="mobile-track-list">
              {data.items.map((track) => (
                <button key={track.id} type="button" className="mobile-track-card" onClick={() => openTrack(track)}>
                  <div className="mobile-track-head">
                    <span className="track-icon"><SoundOutlined /></span>
                    <span className="mobile-track-title"><strong>{track.title}</strong><small>{track.isrc}</small></span>
                    <StatusTag code={track.trackStatusCode} label={statusName(track)} />
                  </div>
                  <dl>
                    <div><dt>{t('tracks.columns.artist')}</dt><dd>{track.artistName}</dd></div>
                    <div><dt>{t('tracks.columns.genre')}</dt><dd>{track.genre || '—'}</dd></div>
                    <div><dt>{t('tracks.columns.release')}</dt><dd>{formatDate(track.releaseDate, language)}</dd></div>
                    <div><dt>{t('tracks.columns.dsps')}</dt><dd>{formatNumber(track.dspAssignmentsCount, language)}</dd></div>
                  </dl>
                </button>
              ))}
              <Pagination
                current={data.pageNumber}
                pageSize={data.pageSize}
                total={data.totalCount}
                showSizeChanger={false}
                onChange={(page) => setFilter('page', page)}
              />
            </div>
          </>
        ) : (
          <Empty description={t('tracks.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Space>
              {activeFilterCount > 0 && <Button onClick={clearFilters}>{t('common.clearFilters')}</Button>}
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('tracks.createAction')}</Button>
            </Space>
          </Empty>
        )}
      </Card>

      <CreateTrackDrawer
        open={createOpen}
        artists={(artistsResource.data ?? []) as Artist[]}
        onClose={() => setCreateOpen(false)}
        onCreated={(track) => {
          setCreateOpen(false)
          tracksResource.refresh()
          message.success(t('tracks.openingCreated'))
          navigate(`/tracks/${track.id}`, { state: { from: location.pathname + location.search } })
        }}
      />
    </div>
  )
}
