import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/application/web/components/ui/button'

type MediaType = 'qiita' | 'zenn' | 'all'

export default function MediaFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mediaParam = searchParams.get('media')
  const currentMedia: MediaType =
    mediaParam === 'qiita' || mediaParam === 'zenn' ? mediaParam : 'all'

  const handleMediaChange = useCallback(
    (media: MediaType) => {
      const newParams = new URLSearchParams(searchParams)
      // ページをリセット
      newParams.delete('page')

      if (media === 'all') {
        newParams.delete('media')
      } else {
        newParams.set('media', media)
      }
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams],
  )

  return (
    <div className='mb-4 flex gap-2'>
      <Button
        variant={currentMedia === 'all' ? 'default' : 'outline'}
        size='sm'
        onClick={() => handleMediaChange('all')}
      >
        全て
      </Button>
      <Button
        variant={currentMedia === 'qiita' ? 'default' : 'outline'}
        size='sm'
        onClick={() => handleMediaChange('qiita')}
      >
        Qiita
      </Button>
      <Button
        variant={currentMedia === 'zenn' ? 'default' : 'outline'}
        size='sm'
        onClick={() => handleMediaChange('zenn')}
      >
        Zenn
      </Button>
    </div>
  )
}
