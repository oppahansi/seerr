import useSettings from '@app/hooks/useSettings';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

// Pages that show a backdrop of their own
const OWN_BACKDROP_ROUTES = [
  '/movie/',
  '/tv/',
  '/collection/',
  '/issues/[issueId]',
];

export const hasOwnBackdrop = (pathname: string) =>
  OWN_BACKDROP_ROUTES.some((route) => pathname.startsWith(route));

/**
 * A random, blurred and dimmed backdrop behind pages that have none of
 * their own. It changes on every page navigation and fades between images.
 **/
const RandomBackdrop = () => {
  const router = useRouter();
  const { currentSettings } = useSettings();
  const { data: backdrops } = useSWR<string[]>('/api/v1/backdrops', {
    refreshInterval: 0,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
  });
  // The previous and the current image, so the new one can fade in over the old
  const [layers, setLayers] = useState<string[]>([]);
  const lastUrl = useRef<string | undefined>(undefined);
  const ownBackdrop = hasOwnBackdrop(router.pathname);

  useEffect(() => {
    if (ownBackdrop || !backdrops?.length) {
      return;
    }

    let path: string;
    do {
      path = backdrops[Math.floor(Math.random() * backdrops.length)];
    } while (
      backdrops.length > 1 &&
      lastUrl.current?.endsWith(path) // same image as before
    );

    const tmdbUrl = `https://image.tmdb.org/t/p/w1280${path}`;
    const url = currentSettings.cacheImages
      ? tmdbUrl.replace(/^https:\/\/image\.tmdb\.org\//, '/imageproxy/tmdb/')
      : tmdbUrl;

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) {
        lastUrl.current = url;
        setLayers((current) => [...current.slice(-1), url]);
      }
    };
    image.src = url;

    return () => {
      cancelled = true;
    };
  }, [backdrops, ownBackdrop, router.pathname, currentSettings.cacheImages]);

  if (ownBackdrop || !layers.length) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-75"
      aria-hidden
    >
      {layers.map((url, i) => (
        <div
          key={url}
          className={`absolute inset-0 scale-110 bg-cover bg-center blur-[20px] ${
            i === layers.length - 1 ? 'animate-backdrop-in' : ''
          }`}
          style={{ backgroundImage: `url("${url}")` }}
        />
      ))}
    </div>
  );
};

export default RandomBackdrop;
