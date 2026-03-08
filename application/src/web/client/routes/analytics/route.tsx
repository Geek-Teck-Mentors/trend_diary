import type { MetaFunction } from 'react-router'
import { useOutletContext } from 'react-router'
import type { AppLayoutOutletContext } from '../app-layout'
import useAnalytics from '../diary/hooks/use-analytics'
import DiaryPage from '../diary/page'

export const meta: MetaFunction = () => [{ title: '統計 | TrendDiary' }]

export default function AnalyticsRoute() {
  const { isLoggedIn } = useOutletContext<AppLayoutOutletContext>()
  const {
    selectedDate,
    summaryRange,
    weeklySummary,
    dailySummary,
    sources,
    reads,
    readPagination,
    isLoading,
    selectDate,
    clearSelectedDate,
    toNextPage,
    toPrevPage,
  } = useAnalytics(isLoggedIn)

  return (
    <DiaryPage
      isLoggedIn={isLoggedIn}
      mode='analytics'
      selectedDate={selectedDate}
      summaryRange={summaryRange}
      weeklySummary={weeklySummary}
      dailySummary={dailySummary}
      sources={sources}
      reads={reads}
      readPagination={readPagination}
      isLoading={isLoading}
      onSelectDate={selectDate}
      onClearSelectedDate={clearSelectedDate}
      onNextPage={toNextPage}
      onPrevPage={toPrevPage}
    />
  )
}
