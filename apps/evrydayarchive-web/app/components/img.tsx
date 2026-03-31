'use client';

import NextImage, { type ImageProps } from 'next/image';

const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

/**
 * Drop-in replacement for next/image that adds right-click and drag
 * protection across all images on the public site.
 */
export default function Image(props: ImageProps) {
  return <NextImage draggable={false} onContextMenu={preventContextMenu} {...props} />;
}
