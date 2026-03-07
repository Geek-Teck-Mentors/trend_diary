import type { MetaFunction } from 'react-router'
import { useOutletContext } from 'react-router'
import type { AppLayoutOutletContext } from '../app-layout'
import useDiary from './hooks/use-diary'
import DiaryPage from './page'

export const meta: MetaFunction = () => [{ title: 'ダイアリー | TrendDiary' }]

export default function DiaryRoute() {
  const { isLoggedIn } = useOutletContext<AppLayoutOutletContext>()
  const {
    mode,
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
  } = useDiary(isLoggedIn)

  return (
    <DiaryPage
      isLoggedIn={isLoggedIn}
      mode={mode}
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
