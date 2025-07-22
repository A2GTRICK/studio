
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateImageFromHint } from '@/ai/flows/generate-image-from-hint';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


interface AiImageProps {
  alt: string;
  'data-ai-hint': string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
}

export function AiImage({ 'data-ai-hint': hint, alt, className, fill, ...props }: AiImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const placeholderUrl = `https://placehold.co/${props.width || 600}x${props.height || 400}.png`;
    
    async function fetchImage() {
      setIsLoading(true);
      setError(false);
      try {
        const result = await generateImageFromHint({ hint });
        if (isMounted) {
          setImageUrl(result.imageDataUri);
        }
      } catch (e) {
        console.error(`Failed to generate image for hint: "${hint}"`, e);
        if (isMounted) {
          setError(true);
          setImageUrl(placeholderUrl);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (hint) {
      fetchImage();
    } else {
        setImageUrl(placeholderUrl);
        setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [hint, props.width, props.height]);

  const imageProps = {
    alt,
    className,
    ...(fill ? { fill: true, style: { objectFit: 'cover' } } : { width: props.width, height: props.height }),
  };
  
  const finalSrc = imageUrl || `https://placehold.co/${props.width || 600}x${props.height || 400}.png`;

  if (isLoading) {
    if (fill) {
        return <Skeleton className={cn('absolute inset-0', className)} />;
    }
    return <Skeleton style={{width: props.width, height: props.height}} className={className} />;
  }
  

  return <Image src={finalSrc} {...imageProps} />;
}
