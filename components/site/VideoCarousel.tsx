"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/data";
import {
  instagramEmbedUrl,
  instagramWatchUrl,
  parseVideoUrl,
  youtubeEmbedUrl,
  youtubeThumbnail,
} from "@/lib/data-client";

/* ------------------------------------------------------------------ */
/* Swipeable video carousel: touch-swipeable scroll-snap track, arrow   */
/* buttons, and dots. YouTube slides use a click-to-play facade so no   */
/* iframe mounts until the visitor taps play. Instagram slides render   */
/* the public-post embed, falling back to an outbound card if it fails. */
/* ------------------------------------------------------------------ */

function PlayButton() {
  return (
    <span
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald shadow-lift transition-transform group-hover:scale-105"
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
    <div className="card group overflow-hidden">
      <div className="relative aspect-video w-full bg-ink">
        {playing ? (
          <iframe
            src={youtubeEmbedUrl(parsed.key)}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="absolute inset-0 block h-full w-full text-left"
            aria-label={`Play: ${video.title}`}
          >
            <img
              src={youtubeThumbnail(parsed.key)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/25">
              <PlayButton />
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="line-clamp-2 text-sm font-semibold text-ink">
          {video.title}
        </p>
        <span className="badge shrink-0 bg-red-50 text-red-700">YouTube</span>
      </div>
    </div>
  );
}

function InstagramSlide({ video }: { video: Video }) {
  const parsed = parseVideoUrl(video.url);
  const [failed, setFailed] = useState(false);
  if (!parsed) return null;

  return (
    <div className="card overflow-hidden">
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
            Instagram pe dekho →
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
      <div className="flex items-center justify-between gap-3 border-t border-line p-4">
        <p className="line-clamp-2 text-sm font-semibold text-ink">
          {video.title}
        </p>
        <a
          href={instagramWatchUrl(parsed.key)}
          target="_blank"
          rel="noopener noreferrer"
          className="badge shrink-0 bg-gold-soft text-gold-dark hover:underline"
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

  function slideWidth(): number {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return 320;
    const first = track.children[0] as HTMLElement;
    return first.offsetWidth + 16; // gap-4
  }

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(videos.length - 1, i));
    track.scrollTo({ left: clamped * slideWidth(), behavior: "smooth" });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const el = track;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = slideWidth();
        if (w > 0) {
          const i = Math.round(el.scrollLeft / w);
          setIndex(Math.max(0, Math.min(videos.length - 1, i)));
        }
      });
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [videos.length]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="btn-outline !rounded-full !px-3.5 !py-2 disabled:opacity-40"
          aria-label="Previous videos"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === videos.length - 1}
          className="btn-outline !rounded-full !px-3.5 !py-2 disabled:opacity-40"
          aria-label="Next videos"
        >
          →
        </button>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
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

      <div className="mt-5 flex items-center justify-center gap-2">
        {videos.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to video ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-emerald" : "w-2 bg-line hover:bg-smoke/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
