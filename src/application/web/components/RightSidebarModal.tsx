import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton: boolean;
};

export default function RightSidebarModal({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
}: Props) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    }
    setIsAnimating(false);
    const timer = setTimeout(() => {
      setShouldRender(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role='button'
        tabIndex={0}
        aria-label='モーダルを閉じる'
      />

      {/* Right Sidebar Modal */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-96 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='h-full overflow-y-auto p-6'>
          {/* Header */}
          <div className='mb-6 flex items-start justify-between'>
            {showCloseButton && (
              <button
                type='button'
                onClick={onClose}
                className='rounded-full p-2 transition-colors hover:bg-gray-100'
              >
                <X className='h-5 w-5 text-gray-500' />
              </button>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </>
  );
}
