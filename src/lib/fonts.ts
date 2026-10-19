import localFont from 'next/font/local';

export const plexSans = localFont({
  src: [
    {
      path: '../../public/fonts/IBMPlexSansCondensed-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansCondensed-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-plex-sans',
  display: 'swap',
});

export const plexSerif = localFont({
  src: [
    {
      path: '../../public/fonts/IBMPlexSerif-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSerif-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/IBMPlexSerif-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-plex-serif',
  display: 'swap',
});

export const plexMono = localFont({
  src: [
    {
      path: '../../public/fonts/IBMPlexMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
});
