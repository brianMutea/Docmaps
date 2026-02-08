'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'

interface ImageItem {
  src: string
  alt: string
  caption?: string
}

interface ImageGalleryProps {
  images: ImageItem[]
  columns?: 2 | 3 | 4
}

export function ImageGallery({ images, columns = 3 }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <>
      <div className={`grid ${gridColsClass[columns]} gap-4 my-6`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
            onClick={() => openLightbox(index)}
          >
            <div className="relative aspect-video">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes={`(max-width: 768px) 100vw, (max-width: 1200px) ${100 / columns}vw, ${100 / columns}vw`}
              />
            </div>
            {image.caption && (
              <div className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {images[selectedIndex].caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg max-w-2xl text-center">
              {images[selectedIndex].caption}
            </div>
          )}
        </div>
      )}
    </>
  )
}
