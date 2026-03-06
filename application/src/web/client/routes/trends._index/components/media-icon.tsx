export type MediaType = 'qiita' | 'zenn' | 'hatena'

const mediaConfig: Record<MediaType, { iconImage: string; altText: string }> = {
  qiita: {
    iconImage: '/images/qiita-icon.png',
    altText: 'qiita icon',
  },
  zenn: {
    iconImage: '/images/zenn-icon.svg',
    altText: 'zenn icon',
  },
  hatena: {
    iconImage: '/images/hatena-icon.svg',
    altText: 'hatena icon',
  },
}

type Props = {
  media: MediaType
}

export default function MediaIcon({ media }: Props) {
  const config = mediaConfig[media]

  return <img src={config.iconImage} alt={config.altText} className='h-6 w-6 rounded-sm' />
}
