import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
  isNew?: boolean;
  discountPercent?: number;
  inStock?: boolean;
}

export function ProductGallery({
  images,
  productName,
  selectedIndex: externalIndex,
  onSelectIndex,
  isNew,
  discountPercent,
  inStock = true,
}: ProductGalleryProps) {
  const safeImages = images && images.length > 0 ? images : ['/placeholder.png'];
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;

  const setActiveIndex = useCallback(
    (idx: number) => {
      const normalized = (idx + safeImages.length) % safeImages.length;
      if (onSelectIndex) {
        onSelectIndex(normalized);
      } else {
        setInternalIndex(normalized);
      }
    },
    [safeImages.length, onSelectIndex]
  );

  // Lightbox state & zoom
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Hover zoom lens state for main image
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Touch swipe tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const swipeThreshold = 45;

    if (diff > swipeThreshold) {
      // Swiped left -> next image
      setActiveIndex(activeIndex + 1);
    } else if (diff < -swipeThreshold) {
      // Swiped right -> prev image
      setActiveIndex(activeIndex - 1);
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex(activeIndex - 1);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex(activeIndex + 1);
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isLightboxOpen, setActiveIndex]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div className="space-y-4" id="product-gallery">
      {/* Main Image Showcase Frame */}
      <div
        ref={mainImageRef}
        className="group relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-xs cursor-zoom-in select-none"
        onMouseEnter={() => setIsHoverZooming(true)}
        onMouseLeave={() => setIsHoverZooming(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          setIsLightboxOpen(true);
          setZoomLevel(1);
        }}
        role="region"
        aria-label={`${productName} image gallery preview`}
      >
        <img
          src={safeImages[activeIndex]}
          alt={`${productName} — View ${activeIndex + 1} of ${safeImages.length}`}
          referrerPolicy="no-referrer"
          loading="eager"
          className="h-full w-full object-cover transition-transform duration-300 ease-out"
          style={
            isHoverZooming
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: 'scale(1.45)',
                }
              : undefined
          }
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          {!inStock ? (
            <Badge variant="destructive" className="font-mono text-[10px] tracking-wider uppercase font-bold">
              Sold Out
            </Badge>
          ) : (
            <>
              {isNew && (
                <Badge variant="default" className="font-mono text-[10px] tracking-wider uppercase font-semibold">
                  New Release
                </Badge>
              )}
              {discountPercent !== undefined && discountPercent > 0 && (
                <Badge variant="secondary" className="bg-amber-500 text-white font-mono text-[10px] font-bold">
                  -{discountPercent}% Off
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Zoom Lightbox Trigger Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
            setZoomLevel(1);
          }}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2.5 text-neutral-800 backdrop-blur-md transition-all hover:bg-white hover:scale-105 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:bg-neutral-800 shadow-xs"
          aria-label="Open full resolution lightbox"
          title="Open fullscreen view"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Previous / Next Overlay Controls */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(activeIndex - 1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 p-2 text-neutral-800 backdrop-blur-md opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all hover:bg-white hover:scale-110 dark:bg-neutral-900/80 dark:text-white dark:hover:bg-neutral-800 shadow-sm"
              aria-label="Previous product image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(activeIndex + 1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 p-2 text-neutral-800 backdrop-blur-md opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all hover:bg-white hover:scale-110 dark:bg-neutral-900/80 dark:text-white dark:hover:bg-neutral-800 shadow-sm"
              aria-label="Next product image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Pagination Dots (Mobile) */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:hidden">
            {safeImages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === i ? 'w-5 bg-neutral-900 dark:bg-white' : 'w-1.5 bg-neutral-400/60 dark:bg-neutral-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {safeImages.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin focus:outline-none"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`View ${productName} image ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/20 scale-95 shadow-xs'
                  : 'border-transparent opacity-65 hover:opacity-100 hover:scale-98'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal with Zoom & Lightbox Controls */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 select-none"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} high-resolution image gallery`}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Control Bar */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                {productName}
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-neutral-300">
                {activeIndex + 1} / {safeImages.length}
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.35))}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                title="Zoom In"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.35))}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                title="Reset Zoom"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-red-500/80 transition-colors ml-2"
                title="Close (Esc)"
                aria-label="Close lightbox"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Display with Pan & Zoom */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={safeImages[activeIndex]}
              alt={`${productName} full screen view`}
              referrerPolicy="no-referrer"
              className="max-h-[82vh] max-w-[88vw] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* Lightbox Navigation Controls */}
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(activeIndex - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-all"
                aria-label="Previous image in lightbox"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(activeIndex + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-all"
                aria-label="Next image in lightbox"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
