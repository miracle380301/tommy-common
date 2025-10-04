import React, { useState } from 'react';
import { Grid } from '../../level1/Grid';
import { Modal } from '../../level1/Modal';
import { Button } from '../../level1/Button';
import { Flex } from '../../level1/Flex';
import type { Theme } from '../../utils/types';
import './ImageGallery.css';

export interface ImageItem {
  src: string;
  alt?: string;
  thumbnail?: string;
  caption?: string;
}

export interface ImageGalleryProps {
  images: ImageItem[];
  columns?: number | { sm?: number; md?: number; lg?: number };
  theme?: Theme;
  onImageClick?: (index: number) => void;
  showLightbox?: boolean;
}

export const ImageGallery = React.forwardRef<HTMLDivElement, ImageGalleryProps>(
  (
    {
      images,
      columns = { md: 3, lg: 4 },
      theme = 'minimal',
      onImageClick,
      showLightbox = true,
    },
    ref
  ) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleImageClick = (index: number) => {
      if (onImageClick) {
        onImageClick(index);
      }
      if (showLightbox) {
        setCurrentIndex(index);
        setLightboxOpen(true);
      }
    };

    const goToPrevious = () => {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const goToNext = () => {
      setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
    };

    return (
      <>
        <div ref={ref} className="image-gallery" data-theme={theme}>
          <Grid columns={columns} gap="md">
            {images.map((image, index) => (
              <div
                key={index}
                className="image-gallery__item"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.thumbnail || image.src}
                  alt={image.alt || `Image ${index + 1}`}
                  className="image-gallery__img"
                />
                {image.caption && (
                  <div className="image-gallery__caption">{image.caption}</div>
                )}
              </div>
            ))}
          </Grid>
        </div>

        {showLightbox && lightboxOpen && (
          <Modal
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            size="xl"
            theme={theme}
          >
            <Modal.Body>
              <Flex direction="column" align="center" gap="md">
                <img
                  src={images[currentIndex].src}
                  alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '80vh' }}
                />
                {images[currentIndex].caption && (
                  <p className="image-gallery__lightbox-caption">
                    {images[currentIndex].caption}
                  </p>
                )}

                {/* Navigation */}
                <Flex gap="md" align="center">
                  <Button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                  >
                    이전
                  </Button>
                  <span className="image-gallery__counter">
                    {currentIndex + 1} / {images.length}
                  </span>
                  <Button
                    onClick={goToNext}
                    disabled={currentIndex === images.length - 1}
                  >
                    다음
                  </Button>
                </Flex>
              </Flex>
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }
);

ImageGallery.displayName = 'ImageGallery';
