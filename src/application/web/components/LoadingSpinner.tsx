import React from 'react';
import SpinnerCircle3 from './customized/spinner/spinner-09';

type Props = {
  isLoading: boolean;
};

export default function LoadingSpinner({ isLoading }: Props) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className='bg-opacity-75 fixed inset-0 flex items-center justify-center bg-gray-50 backdrop-blur-sm'>
      <SpinnerCircle3 />
    </div>
  );
}