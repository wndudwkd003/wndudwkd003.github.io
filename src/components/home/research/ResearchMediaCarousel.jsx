import { useEffect, useRef, useState } from "react";

const DEFAULT_AUTOPLAY_MS = 6500;

export function ResearchMediaCarousel({ items, title, autoplayMs = DEFAULT_AUTOPLAY_MS }) {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === "undefined");
    const [isPaused, setIsPaused] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const mediaItems = Array.isArray(items) ? items : [];
    const mediaCount = mediaItems.length;

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
        updatePreference();
        mediaQuery.addEventListener("change", updatePreference);
        return () => mediaQuery.removeEventListener("change", updatePreference);
    }, []);

    useEffect(() => {
        const node = carouselRef.current;
        if (!node || typeof IntersectionObserver === "undefined") return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.35 },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (mediaCount <= 1 || isPaused || !isInView || prefersReducedMotion || document.hidden) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            setIsLoaded(false);
            setActiveIndex((current) => (current + 1) % mediaCount);
        }, autoplayMs);

        return () => window.clearTimeout(timer);
    }, [activeIndex, autoplayMs, isInView, isPaused, mediaCount, prefersReducedMotion]);

    if (mediaCount === 0) {
        return <div className="research-timeline-image-fallback">Media unavailable</div>;
    }

    const safeActiveIndex = activeIndex % mediaCount;
    const activeMedia = mediaItems[safeActiveIndex];
    const showPrevious = () => {
        setIsLoaded(false);
        setActiveIndex((current) => (current - 1 + mediaCount) % mediaCount);
    };
    const showNext = () => {
        setIsLoaded(false);
        setActiveIndex((current) => (current + 1) % mediaCount);
    };
    const showMedia = (index) => {
        if (index === safeActiveIndex) return;
        setIsLoaded(false);
        setActiveIndex(index);
    };

    return (
        <div
            ref={carouselRef}
            className="research-media-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label={`${title} media gallery`}
            aria-busy={!isLoaded}
            tabIndex={0}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
            }}
            onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    showPrevious();
                }
                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    showNext();
                }
            }}
        >
            <div className={`research-media-carousel-stage is-${activeMedia.theme}`}>
                {!isLoaded && <span className="research-media-carousel-loader" aria-hidden="true" />}
                <img
                    key={activeMedia.src}
                    src={activeMedia.src}
                    alt={activeMedia.alt || `${title} media ${safeActiveIndex + 1}`}
                    className={`research-timeline-image is-${activeMedia.fit}${isLoaded ? " is-loaded" : " is-loading"}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={(event) => {
                        const image = event.currentTarget;
                        if (activeMedia.fallbackSrc && image.dataset.fallbackUsed !== "true") {
                            image.dataset.fallbackUsed = "true";
                            image.src = activeMedia.fallbackSrc;
                            return;
                        }

                        setIsLoaded(true);
                    }}
                />

                {mediaCount > 1 && (
                    <div className="research-media-carousel-controls">
                        <button type="button" className="research-media-carousel-arrow" onClick={showPrevious} aria-label="Previous media">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button type="button" className="research-media-carousel-arrow" onClick={showNext} aria-label="Next media">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m9.5 5.5 6.5 6.5-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                )}

                {mediaCount > 1 && <span className="research-media-carousel-count">{safeActiveIndex + 1} / {mediaCount}</span>}
            </div>

            {mediaCount > 1 && (
                <div className="research-media-carousel-dots" aria-label="Choose media">
                    {mediaItems.map((media, index) => (
                        <button
                            key={media.src}
                            type="button"
                            className={`research-media-carousel-dot${index === safeActiveIndex ? " is-active" : ""}`}
                            aria-label={`Show media ${index + 1}`}
                            aria-current={index === safeActiveIndex ? "true" : undefined}
                            onClick={() => showMedia(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
