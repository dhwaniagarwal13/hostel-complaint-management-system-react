import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageViewer({ images = [], currentIndex = 0, onClose, isOpen }) {
  const [index, setIndex] = React.useState(currentIndex);

  if (!isOpen || images.length === 0) return null;

  const goToPrevious = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-surface rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <X size={24} className="text-on-surface" strokeWidth={2.5} />
        </button>

        {/* Main image */}
        <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
          <img
            src={images[index]}
            alt={`Image ${index + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>

        {/* Navigation and counter */}
        {images.length > 1 && (
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-surface rounded-lg border border-outline/10">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant hover:text-primary"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <div className="flex-1 text-center">
              <p className="text-sm font-black text-on-surface-variant">
                <span className="text-on-surface font-black text-lg">{index + 1}</span>
                <span> of </span>
                <span className="text-on-surface font-black text-lg">{images.length}</span>
              </p>
            </div>

            <button
              onClick={goToNext}
              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant hover:text-primary"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
