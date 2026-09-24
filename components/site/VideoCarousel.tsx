"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Video } from "@/lib/data";
import {
  instagramEmbedUrl,
  instagramWatchUrl,
  parseVideoUrl,
  youtubeEmbedUrl,
  youtubeThumbnail,
} from "@/lib/data-client";

/* ------------------------------------------------------------------ */
/* Smooth Auto-sliding Video Carousel with Pause-on-Hover & Infinite  */
/* Loop. YouTube slides use a click-to-play facade with instant play. */
/* ------------------------------------------------------------------ */

function PlayButton() {
  return (
    <span
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald text-white shadow-lift transition-transform duration-300 group-hover:scale-110 active:scale-95"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M7 4.5v13l11-6.5-11-6.5Z" fill="#fff" />
      </svg>
    </span>
  );
}

function YouTubeSlide({
  video,
  playing,
  onPlay,
}: {
  video: Video;
  playing: boolean;
  onPlay: () => void;
}) {
  const parsed = parseVideoUrl(video.url);
  if (!parsed) return null;
  return (
    <div className="card group overflow-hidden border border-line hover:border-emerald/40 transition-all hover:shadow-card bg-white">
      <div className="relative aspect-video w-full bg-ink">
        {playing ? (
          <iframe
            src={`${youtubeEmbedUrl(parsed.key)}?autoplay=1`}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="absolute inset-0 block h-full w-full text-left cursor-pointer group"
            aria-label={`Play: ${video.title}`}
          >
            <img
              src={youtubeThumbnail(parsed.key)}
              alt={video.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/25 group-hover:bg-ink/35 transition-colors">
              <PlayButton />
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4 bg-white">
        <p className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-emerald-dark transition-colors">
          {video.title}
        </p>
        <span className="badge shrink-0 bg-red-50 text-red-700 font-semibold">YouTube</span>
      </div>
    </div>
  );
}

function InstagramSlide({ video }: { video: Video }) {
  const parsed = parseVideoUrl(video.url);
  const [failed, setFailed] = useState(false);
  if (!parsed) return null;

  return (
    <div className="card overflow-hidden border border-line hover:border-emerald/40 transition-all hover:shadow-card bg-white">
      {failed ? (
        <a
          href={instagramWatchUrl(parsed.key)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 bg-cream p-6 text-center"
        >
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8842F" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1.2" fill="#A8842F" stroke="none" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-ink">{video.title}</span>
          <span className="btn-outline !px-4 !py-2 !text-xs">
            Watch on Instagram ↗
          </span>
        </a>
      ) : (
        <div className="aspect-[4/5] w-full bg-white">
          <iframe
            src={instagramEmbedUrl(parsed.key)}
            title={video.title}
            className="h-full w-full"
            loading="lazy"
            scrolling="no"
            frameBorder={0}
            allowTransparency
            onError={() => setFailed(true)}
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-3 border-t border-line p-4 bg-white">
        <p className="line-clamp-2 text-sm font-semibold text-ink">
          {video.title}
        </p>
        <a
          href={instagramWatchUrl(parsed.key)}
          target="_blank"
          rel="noopener noreferrer"
          className="badge shrink-0 bg-gold-soft text-gold-dark hover:underline font-semibold"
        >
          Instagram ↗
        </a>
      </div>
    </div>
  );
}

export default function VideoCarousel({ videos }: { videos: Video[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slideWidth = useCallback((): number => {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return 320;
    const first = track.children[0] as HTMLElement;
    return first.offsetWidth + 16; // 16px is gap-4
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track || videos.length === 0) return;
      const target = ((i % videos.length) + videos.length) % videos.length;
      setIndex(target);
      const w = slideWidth();
      track.scrollTo({ left: target * w, behavior: "smooth" });
    },
    [videos.length, slideWidth]
  );

  // Auto-sliding interval: slides smoothly every 3.2 seconds
  useEffect(() => {
    if (isPaused || playingId !== null || videos.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((curr) => {
        const next = (curr + 1) % videos.length;
        const track = trackRef.current;
        if (track) {
          const w = slideWidth();
          track.scrollTo({ left: next * w, behavior: "smooth" });
        }
        return next;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, playingId, videos.length, slideWidth]);

  // Sync scroll position with active dot index on manual swipe/scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!track) return;
        const w = slideWidth();
        if (w > 0) {
          const i = Math.round(track.scrollLeft / w);
          const clamped = Math.max(0, Math.min(videos.length - 1, i));
          setIndex(clamped);
        }
      });
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [videos.length, slideWidth]);

  // Clean up resume timer
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleTouchStart = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3500);
  };

  return (
    <div className="relative">
      {/* Carousel Top Controls */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-smoke">
          <span
            className={`inline-block h-2 w-2 rounded-full transition-colors ${
              playingId
                ? "bg-red-500"
                : isPaused
                ? "bg-amber-400"
                : "bg-emerald animate-pulse"
            }`}
          />
          <span>
            {playingId
              ? "Playing Video • Auto-slide Paused"
              : isPaused
              ? "Paused on Hover"
              : "Auto-sliding • Hover to pause"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="h-10 w-10 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-emerald hover:text-white hover:border-emerald transition-all active:scale-95 shadow-sm"
            aria-label="Previous video"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="h-10 w-10 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-emerald hover:text-white hover:border-emerald transition-all active:scale-95 shadow-sm"
            aria-label="Next video"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Auto-sliding Carousel Track */}
      <div
        ref={trackRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 cursor-grab active:cursor-grabbing scroll-smooth"
      >
        {videos.map((v) => (
          <div
            key={v.id}
            className="w-[86%] shrink-0 snap-center sm:w-[62%] lg:w-[46%]"
          >
            {v.type === "youtube" ? (
              <YouTubeSlide
                video={v}
                playing={playingId === v.id}
                onPlay={() => setPlayingId(v.id)}
              />
            ) : (
              <InstagramSlide video={v} />
            )}
          </div>
        ))}
      </div>

      {/* Dot Indicators with animated active expansion */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {videos.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to video ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-8 bg-emerald shadow-sm"
                : "w-2 bg-line hover:bg-smoke/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
