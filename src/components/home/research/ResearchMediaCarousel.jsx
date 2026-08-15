import { useEffect, useMemo, useRef, useState } from "react";

export function ResearchMediaCarousel({ items, title }) {
    const carouselRef = useRef(null);
    const preloadersRef = useRef([]);
    const preloadedSourcesRef = useRef(new Set());
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldPreload, setShouldPreload] = useState(() => typeof IntersectionObserver === "undefined");
    const mediaItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
    const mediaCount = mediaItems.length;

    useEffect(() => {
        const node = carouselRef.current;
        if (!node || shouldPreload || typeof IntersectionObserver === "undefined") return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setShouldPreload(true);
                observer.disconnect();
            },
            { rootMargin: "1000px 0px" },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [shouldPreload]);

    useEffect(() => {
        if (!shouldPreload || mediaCount <= 1) return;

        const orderedMedia = [
            ...mediaItems.slice(activeIndex + 1),
            ...mediaItems.slice(0, activeIndex + 1),
        ];

        for (const media of orderedMedia) {
            const src = String(media?.src || "").trim();
            if (!src || preloadedSourcesRef.current.has(src)) continue;

            preloadedSourcesRef.current.add(src);
            const image = new window.Image();
            image.decoding = "async";
            image.src = src;
            preloadersRef.current.push(image);
        }
    }, [activeIndex, mediaCount, mediaItems, shouldPreload]);

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
                    loading={shouldPreload ? "eager" : "lazy"}
                    fetchPriority={shouldPreload ? "high" : "auto"}
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
