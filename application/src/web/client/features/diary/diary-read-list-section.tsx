import { AnchorLink } from '@/web/client/components/ui/link'
import type { ReadItem } from '@/web/client/features/diary/types'
import MediaIcon from '@/web/client/routes/trends._index/components/media-icon'

const toJstTimeString = (date: Date) =>
  date.toLocaleTimeString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

type Props = {
  isLoading: boolean
  shouldShowDailyDetails: boolean
  reads: ReadItem[]
}

export default function DiaryReadListSection({ isLoading, shouldShowDailyDetails, reads }: Props) {
  return (
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
  )
}
