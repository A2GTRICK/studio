
'use client';

import React, { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { generateImageFromHint } from '@/ai/flows/generate-image-from-hint';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type AiImageProps = Omit<ImageProps, 'src' | 'data-ai-hint'> & {
  'data-ai-hint': string;
  'data-ai-id'?: string;
};

// A tiny, transparent 1x1 pixel GIF.
const BLANK_IMAGE_DATA_URI =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export function AiImage({ 'data-ai-hint': hint, 'data-ai-id': id, alt, className, ...props }: AiImageProps) {
  const [src, setSrc] = useState<string>(BLANK_IMAGE_DATA_URI);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    
    async function generate() {
      if (!hint) {
        setIsLoading(false);
        return;
      }
      
      try {
        const result = await generateImageFromHint({ hint });
        if (!isCancelled && result.imageDataUri) {
          setSrc(result.imageDataUri);
        }
      } catch (error) {
        console.error(`Failed to generate image for hint "${hint}":`, error);
        // In case of an error, we can keep the placeholder or use a fallback.
        // For now, it will just show the blank image.
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    generate();

    return () => {
      isCancelled = true;
    };
  }, [hint]);

  if (isLoading) {
    return <Skeleton className={cn('h-full w-full', className)} />;
  }

  return <Image src={src} alt={alt} className={className} data-ai-id={id} {...props} />;
}
