
'use client';

import Image from 'next/image';
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
  const width = props.width || (fill ? undefined : 600);
  const height = props.height || (fill ? undefined : 400);

  // Directly use the placeholder URL. The data-ai-hint is kept for potential future backend processing.
  const placeholderUrl = `https://placehold.co/${width || 600}x${height || 400}.png`;

  const imageProps: any = {
    alt,
    className,
    ...(fill
      ? { fill: true, style: { objectFit: 'cover' as const } }
      : { width: width, height: height }),
  };

  return <Image src={placeholderUrl} {...imageProps} data-ai-hint={hint} />;
}
