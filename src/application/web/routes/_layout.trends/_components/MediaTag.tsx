import React from 'react';

type Props = {
  media: string;
};

export default function MediaTag({ media }: Props) {
  if (media === 'qiita') {
    return (
      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
        Qiita
      </span>
    );
  }

  if (media === 'zenn') {
    return (
      <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
        Zenn
      </span>
    );
  }

  return (
    <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-medium" />
  );
}
