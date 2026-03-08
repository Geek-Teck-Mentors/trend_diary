import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { toJaDateString } from '@/common/locale/date'
import type { ArticleMedia } from '@/domain/article/media'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/web/client/components/shadcn/chart'
import { cn } from '@/web/client/components/shadcn/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/web/client/components/shadcn/table'
import { AnchorLink } from '@/web/client/components/ui/link'
import MediaIcon from '../trends._index/components/media-icon'

type Source = {
  media: ArticleMedia
  read: number
  skip: number
}

type ReadItem = {
  readHistoryId: string
  articleId: string
  media: ArticleMedia
  title: string
  url: string
  readAt: Date
}

type DiaryMode = 'diary' | 'analytics'

type Props = {
  isLoggedIn: boolean
  mode: DiaryMode
  selectedDate: string | null
  summaryRange: Array<{
    date: string
    read: number
    skip: number
  }>
  weeklySummary: {
    read: number
    skip: number
  }
  dailySummary: {
    read: number
    skip: number
  }
  sources: Source[]
  reads: ReadItem[]
  readPagination: {
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  isLoading: boolean
  onSelectDate: (date: string) => void
  onClearSelectedDate: () => void
  onNextPage: () => void
  onPrevPage: () => void
}

const mediaLabels: Record<ArticleMedia, string> = {
  qiita: 'Qiita',
  zenn: 'Zenn',
  hatena: 'はてブ',
}

const chartConfig = {
  read: {
    label: '読了',
    color: '#3b82f6',
  },
  skip: {
    label: 'スキップ',
    color: '#64748b',
  },
} satisfies ChartConfig

export default function DiaryPage({
  isLoggedIn,
  mode,
  selectedDate,
  summaryRange,
  weeklySummary,
  dailySummary,
  sources,
  reads,
  readPagination,
  isLoading,
  onSelectDate,
  onClearSelectedDate,
  onNextPage,
  onPrevPage,
}: Props) {
  const toJstDate = (date: string) => new Date(`${date}T00:00:00+09:00`)
  const toJstTimeString = (date: Date) =>
    date.toLocaleTimeString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  const isAnalyticsTab = mode === 'analytics'
  const pageTitle = isAnalyticsTab ? '統計' : 'ダイアリー'
  const displaySummary = isAnalyticsTab && !selectedDate ? weeklySummary : dailySummary
  const shouldShowDailyDetails = !isAnalyticsTab || !!selectedDate
  const paginationLabel =
    shouldShowDailyDetails && readPagination.totalPages > 0
      ? `${readPagination.page} / ${readPagination.totalPages}`
      : '- / -'
  const handleChartClick = (state: unknown) => {
    if (!state || typeof state !== 'object' || !('activeLabel' in state)) return
    const activeLabel = state.activeLabel
    if (typeof activeLabel === 'string') {
      onSelectDate(activeLabel)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className='p-6'>
        <h1 className='text-xl font-semibold text-gray-900'>{pageTitle}</h1>
        <p className='mt-4 text-sm text-gray-600'>この機能はログイン時のみ利用できます。</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
      <div className='mx-auto w-full max-w-3xl rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-sm'>
        <h1 className='text-xl font-semibold text-gray-900'>{pageTitle}</h1>

        {isAnalyticsTab && (
          <div className='mt-5'>
            <h2 className='text-sm font-semibold text-gray-700'>グラフ</h2>
            <div
              className='mt-2 rounded-lg border border-gray-200 bg-white p-4'
              data-slot='diary-analytics'
            >
              <div className='flex min-h-8 items-center gap-2'>
                <p className='text-sm font-semibold text-gray-700'>
                  選択日: {selectedDate ? toJaDateString(toJstDate(selectedDate)) : '未選択'}
                </p>
                <button
                  type='button'
                  onClick={onClearSelectedDate}
                  className={cn(
                    'w-[96px] rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100',
                    !selectedDate && 'pointer-events-none invisible',
                  )}
                  data-slot='diary-clear-selected-date'
                >
                  選択をクリア
                </button>
              </div>
              <ChartContainer config={chartConfig} className='mt-3 h-56 w-full'>
                <BarChart data={summaryRange} onClick={handleChartClick}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    tickFormatter={(value) => toJaDateString(toJstDate(value)).slice(5)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey='read'
                    fill='var(--color-read)'
                    radius={4}
                    className='cursor-pointer'
                  />
                  <Bar
                    dataKey='skip'
                    fill='var(--color-skip)'
                    radius={4}
                    className='cursor-pointer'
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}

        <div className='mt-4'>
          <h2 className='text-sm font-semibold text-gray-700'>集計</h2>
          {!isAnalyticsTab && (
            <p className='mt-1 text-sm text-gray-600' data-slot='diary-target-date'>
              対象日: {selectedDate ? toJaDateString(toJstDate(selectedDate)) : '-'}
            </p>
          )}
          <div className='mt-2 rounded-lg border border-gray-200 bg-white p-3'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>媒体</TableHead>
                  <TableHead className='text-right'>読了</TableHead>
                  <TableHead className='text-right'>スキップ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.media}>
                    <TableCell>{mediaLabels[source.media]}</TableCell>
                    <TableCell className='text-right'>{source.read}件</TableCell>
                    <TableCell className='text-right'>{source.skip}件</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className='font-semibold'>合計</TableCell>
                  <TableCell className='text-right font-semibold'>
                    {displaySummary.read}件
                  </TableCell>
                  <TableCell className='text-right font-semibold'>
                    {displaySummary.skip}件
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <div className='mt-6'>
          <h2 className='text-sm font-semibold text-gray-700'>読了した記事一覧</h2>
          {isLoading && shouldShowDailyDetails && (
            <p className='mt-2 text-sm text-gray-500'>読み込み中...</p>
          )}
          {!isLoading && !shouldShowDailyDetails && (
            <p className='mt-2 text-sm text-gray-500'>
              グラフの日付をクリックすると、読了記事一覧を表示します。
            </p>
          )}
          {!isLoading && shouldShowDailyDetails && reads.length === 0 && (
            <p className='mt-2 text-sm text-gray-500'>読了した記事はまだありません。</p>
          )}
          {!isLoading && shouldShowDailyDetails && reads.length > 0 && (
            <ul className='mt-2 space-y-2 text-sm' data-slot='diary-read-list'>
              {reads.map((read) => (
                <li
                  key={read.readHistoryId}
                  className='flex items-center justify-between gap-3 text-gray-800'
                >
                  <div className='flex min-w-0 flex-1 items-center gap-2'>
                    <MediaIcon media={read.media} size='sm' />
                    <AnchorLink
                      to={read.url as `https://${string}`}
                      className='block truncate text-blue-700 underline hover:text-blue-800'
                    >
                      {read.title}
                    </AnchorLink>
                  </div>
                  <p className='shrink-0 text-xs text-gray-500'>{toJstTimeString(read.readAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='mt-4 flex items-center justify-start gap-3'>
          <button
            type='button'
            className='rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={onPrevPage}
            disabled={!shouldShowDailyDetails || !readPagination.hasPrev}
            data-slot='diary-read-prev'
          >
            前へ
          </button>
          <span className='text-sm text-gray-600'>{paginationLabel}</span>
          <button
            type='button'
            className='rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={onNextPage}
            disabled={!shouldShowDailyDetails || !readPagination.hasNext}
            data-slot='diary-read-next'
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  )
}
