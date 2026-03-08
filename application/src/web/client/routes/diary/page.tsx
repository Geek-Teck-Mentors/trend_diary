import DiaryLoginRequired from '@/web/client/features/diary/diary-login-required'
import DiaryReadListSection from '@/web/client/features/diary/diary-read-list-section'
import DiaryReadPagination from '@/web/client/features/diary/diary-read-pagination'
import DiarySummarySection from '@/web/client/features/diary/diary-summary-section'
import {
  type ReadItem,
  type ReadPagination,
  type Source,
  type Summary,
} from '@/web/client/features/diary/types'

type Props = {
  isLoggedIn: boolean
  targetDate: string | null
  dateResolveError: boolean
  dailySummary: Summary
  sources: Source[]
  reads: ReadItem[]
  readPagination: ReadPagination
  isLoading: boolean
  onNextPage: () => void
  onPrevPage: () => void
}

export default function DiaryPage({
  isLoggedIn,
  targetDate,
  dateResolveError,
  dailySummary,
  sources,
  reads,
  readPagination,
  isLoading,
  onNextPage,
  onPrevPage,
}: Props) {
  const pageTitle = 'ダイアリー'

  if (!isLoggedIn) {
    return <DiaryLoginRequired pageTitle={pageTitle} />
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
      <div className='mx-auto w-full max-w-3xl rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-sm'>
        <h1 className='text-xl font-semibold text-gray-900'>{pageTitle}</h1>
        {dateResolveError && (
          <p className='mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
            JST日付の解決に失敗した。時間をおいて再読み込みして。
          </p>
        )}
        <DiarySummarySection
          sources={sources}
          displaySummary={dailySummary}
          targetDate={targetDate ?? undefined}
        />
        <DiaryReadListSection isLoading={isLoading} shouldShowDailyDetails={true} reads={reads} />
        <DiaryReadPagination
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
          readPagination={readPagination}
          shouldShowDailyDetails={true}
        />
      </div>
    </div>
  )
}
