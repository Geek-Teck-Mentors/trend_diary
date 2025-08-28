type MediaType = 'qiita' | 'zenn'
const mediaIconImages = {
  qiita: '/images/qiita-icon.png',
  zenn: '/images/zenn-icon.svg',
} as const
export default function MediaTag({ media }: { media: MediaType }) {
  return (
    <img
      src={mediaIconImages[media]}
      alt={`${media} icon`}
      className='inline-block w-4 h-4 align-middle mr-1.5 mb-1'
      data-slot='media-icon'
    />
  )
}
