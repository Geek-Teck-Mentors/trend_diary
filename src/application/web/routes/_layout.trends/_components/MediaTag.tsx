import React from 'react';

type Props = {
  media: string;
};

export default function MediaTag({ media }: Props) {
  if (media === 'qiita') {
    return (
      <span className='rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white'>
        Qiita
      </span>
    );
  }

  if (media === 'zenn') {
    return (
      <span className='rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white'>
        Zenn
      </span>
    );
  }

  return <span className='rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white' />;
}
