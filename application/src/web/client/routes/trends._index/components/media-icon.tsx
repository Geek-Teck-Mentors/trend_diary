type MediaType = 'qiita' | 'zenn'
const mediaAttributes = {
  qiita: {
    iconImage: '/images/qiita-icon.png',
    altText: 'qiita icon',
  },
  zenn: {
    iconImage: '/images/zenn-icon.svg',
    altText: 'zenn icon',
  },
} as const

export default function MediaTag({ media }: { media: MediaType }) {
  const { iconImage, altText } = mediaAttributes[media]
  return (
    <img
      src={iconImage}
      alt={altText}
      className='inline-block w-4 h-4 align-middle mr-1.5 mb-1'
      data-slot='media-icon'
    />
  )
}
