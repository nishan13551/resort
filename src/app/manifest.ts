import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dhansiri Rest House',
    short_name: 'Dhansiri',
    description: 'ধানসিঁড়ি রেস্ট হাউজ ব্যবস্থাপনা সিস্টেম',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4f6f8',
    theme_color: '#059669',
    lang: 'bn',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}