// src/routes/AwardsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Layout } from "../components/layout/Layout";
import { awards } from "../data/awards";
import siteText from "../data/siteText.json";

const DEFAULT_IMAGE_EXTS = ["jpg", "png", "jpeg", "webp", "gif"];
const THUMBNAIL_DIR = "thumbnail";
const resolvedImageCache = new Map();

function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    return dateStr.slice(0, 7).replace("-", ".");
}

function splitFiles(fileList) {
    const images = [];
    const pdfs = [];
    const others = [];

    const downImages = [];
    const downPdfs = [];
    const downOthers = [];

    (fileList || []).forEach((f) => {
        const isDown = f.down === true;

        if (f.type === "image") {
            images.push(f);
            if (isDown) downImages.push(f);
        } else if (f.type === "pdf") {
            pdfs.push(f);
            if (isDown) downPdfs.push(f);
        } else {
            others.push(f);
            if (isDown) downOthers.push(f);
        }
    });

    return { images, pdfs, others, downImages, downPdfs, downOthers };
}

function getFileLabel(file) {
    if (file.label && String(file.label).trim().length > 0) return file.label;

    const raw = (file.file || file.url || "").split("/").pop() || "file";
    const lastDot = raw.lastIndexOf(".");
    if (lastDot > 0) return raw.slice(0, lastDot);
    return raw;
}

function buildImageCandidates(base, exts, preferredExts = exts) {
    if (!base) return [];

    const out = [];

    for (const ext of preferredExts) {
        out.push(`${base}.${ext}`);

        const upper = ext.toUpperCase();
        if (upper !== ext) out.push(`${base}.${upper}`);
    }

    return [...new Set(out)];
}

function normalizeAward(award) {
    const dir = `/awards/${award.id}`;

    const count = award.images?.count || 0;
    const exts = award.images?.exts || DEFAULT_IMAGE_EXTS;

    const images = Array.from({ length: count }, (_, i) => ({
        type: "image",
        base: `${dir}/a${i + 1}`,
        thumbnailBase: `${dir}/${THUMBNAIL_DIR}/a${i + 1}`,
        exts,
        label: `사진 ${i + 1}`,
    }));

    const downloads = (award.downloads || []).map((d) => ({
        ...d,
        url: `${dir}/${d.file}`,
    }));

    return {
        ...award,
        displayDate: formatDisplayDate(award.date),
        fileList: [...images, ...downloads],
    };
}

function useResolvedImageSource(base, exts) {
    const candidates = useMemo(() => buildImageCandidates(base, exts), [base, exts]);
    const [resolvedSrc, setResolvedSrc] = useState("");

    useEffect(() => {
        let cancelled = false;
        setResolvedSrc("");

        if (candidates.length === 0) {
            return undefined;
        }

        let index = 0;

        const probeNext = () => {
            if (cancelled) return;

            if (index >= candidates.length) {
                setResolvedSrc("");
                return;
            }

            const candidate = candidates[index];
            const probe = new Image();

            probe.onload = () => {
                if (!cancelled) setResolvedSrc(candidate);
            };

            probe.onerror = () => {
                index += 1;
                probeNext();
            };

            probe.src = candidate;
        };

        probeNext();

        return () => {
            cancelled = true;
        };
    }, [candidates]);

    return resolvedSrc;
}

function SmartImage({ base, thumbnailBase, exts, alt, className, wrapperClassName, clickable = false, clickSrc, onClick }) {
    const candidates = useMemo(() => {
        const thumbnailExts = ["webp", ...exts.filter((ext) => ext !== "webp")];

        return [...buildImageCandidates(thumbnailBase, exts, thumbnailExts), ...buildImageCandidates(base, exts)];
    }, [base, thumbnailBase, exts]);
    const cacheKey = useMemo(() => candidates.join("|"), [candidates]);

    const [candidateIndex, setCandidateIndex] = useState(0);
    const [dead, setDead] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const cachedSrc = resolvedImageCache.get(cacheKey);
        const cachedIndex = cachedSrc ? candidates.indexOf(cachedSrc) : -1;

        if (cachedIndex >= 0) {
            setCandidateIndex(cachedIndex);
            setDead(false);
            setLoaded(true);
            return;
        }

        setCandidateIndex(0);
        setDead(candidates.length === 0);
        setLoaded(false);
    }, [cacheKey, candidates]);

    const currentSrc = candidates[candidateIndex] ?? "";

    if (dead) {
        return (
            <div className={`award-image-shell ${wrapperClassName || ""} ${clickable ? "is-clickable" : "is-static"}`.trim()}>
                <span className="award-image-placeholder">FILE</span>
            </div>
        );
    }

    return (
        <div className={`award-image-shell ${wrapperClassName || ""} ${clickable ? "is-clickable" : "is-static"}`.trim()}>
            {!loaded && <span className="award-image-spinner" aria-hidden="true" />}

            <img
                src={currentSrc}
                alt={alt}
                className={`${className} ${loaded ? "is-loaded" : "is-loading"}`}
                onLoad={() => {
                    resolvedImageCache.set(cacheKey, currentSrc);
                    setLoaded(true);
                }}
                onClick={clickable && onClick ? (event) => onClick(event, clickSrc) : undefined}
                onError={() => {
                    setLoaded(false);

                    if (candidateIndex < candidates.length - 1) {
                        setCandidateIndex((value) => value + 1);
                        return;
                    }

                    setDead(true);
                }}
            />
        </div>
    );
}

function AwardCard({ award, expanded, onToggle }) {
    const normalized = useMemo(() => normalizeAward(award), [award]);

    const { images, downImages, downPdfs, downOthers } = useMemo(() => splitFiles(normalized.fileList), [normalized.fileList]);

    const [idx, setIdx] = useState(0);
    const [lightboxUrl, setLightboxUrl] = useState(null);
    const resolvedOriginalSrc = useResolvedImageSource(images[idx]?.base, images[idx]?.exts);

    useEffect(() => {
        if (!expanded) setIdx(0);
    }, [expanded]);

    useEffect(() => {
        if (lightboxUrl) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
    }, [lightboxUrl]);

    const hasSlider = images.length > 0;

    const goPrev = () => setIdx((v) => Math.max(0, v - 1));
    const goNext = () => setIdx((v) => Math.min(images.length - 1, v + 1));

    return (
        <article className="award-card">
            <button type="button" className="award-card-head" onClick={() => onToggle(award.id)} aria-expanded={expanded}>
                <div className="award-thumb-wrapper">
                    {images.length > 0 ? (
                        <SmartImage
                            base={images[0].base}
                            thumbnailBase={images[0].thumbnailBase}
                            exts={images[0].exts}
                            wrapperClassName="award-thumb-media"
                            alt={`${award.title} 썸네일`}
                            className="award-thumb"
                        />
                    ) : (
                        <span className="award-thumb-placeholder">FILE</span>
                    )}
                </div>

                <div className="award-content">
                    <div className="award-meta">
                        {normalized.displayDate}
                        {award.org && ` · ${award.org}`}
                    </div>

                    <h3 className="award-title">{award.title}</h3>

                    {award.description && award.description.trim().length > 0 && <p className="award-text">{award.description}</p>}

                    {award.tags && award.tags.length > 0 && (
                        <div className="award-tags">
                            {award.tags.map((tag) => (
                                <span key={tag} className="award-tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <span className={`award-toggle-icon ${expanded ? "is-open" : ""}`}>▼</span>
            </button>

            {expanded && (
                <div className="award-expand">
                    {lightboxUrl &&
                        createPortal(
                            <div className="award-lightbox-overlay" onClick={() => setLightboxUrl(null)}>
                                <div className="award-lightbox" onClick={(e) => e.stopPropagation()}>
                                    <button type="button" className="award-lightbox-close" onClick={() => setLightboxUrl(null)} aria-label="닫기">
                                        <span className="award-lightbox-close-mark" aria-hidden="true">
                                            ×
                                        </span>
                                    </button>
                                    <img src={lightboxUrl} alt="확대 이미지" className="award-lightbox-img" />
                                </div>
                            </div>,
                            document.body,
                        )}

                    {hasSlider && (
                        <section className="award-slider" aria-label="증서 이미지 슬라이더">
                            <div className="award-slider-stage">
                                <SmartImage
                                    base={images[idx].base}
                                    thumbnailBase={images[idx].thumbnailBase}
                                    exts={images[idx].exts}
                                    wrapperClassName="award-slider-media"
                                    clickable={Boolean(resolvedOriginalSrc)}
                                    clickSrc={resolvedOriginalSrc}
                                    alt={`${award.title} 이미지 ${idx + 1}`}
                                    className="award-slider-img"
                                    onClick={(e, originalSrc) => {
                                        e.stopPropagation();
                                        setLightboxUrl(originalSrc);
                                    }}
                                />

                                {images.length > 1 && (
                                    <div className="award-slider-controls">
                                        <button
                                            type="button"
                                            className="award-slider-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goPrev();
                                            }}
                                            disabled={idx === 0}
                                            aria-label="이전 이미지"
                                        >
                                            <svg viewBox="0 0 24 24" className="award-slider-btn-icon" aria-hidden="true">
                                                <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="award-slider-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goNext();
                                            }}
                                            disabled={idx === images.length - 1}
                                            aria-label="다음 이미지"
                                        >
                                            <svg viewBox="0 0 24 24" className="award-slider-btn-icon" aria-hidden="true">
                                                <path d="m9.5 5.5 6.5 6.5-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="award-slider-dots" aria-label="이미지 선택">
                                    {images.map((_, i) => (
                                        <button
                                            key={`${award.id}-dot-${i}`}
                                            type="button"
                                            className={`award-dot ${i === idx ? "is-active" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIdx(i);
                                            }}
                                            aria-label={`${i + 1}번 이미지 보기`}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {(downImages.length > 0 || downPdfs.length > 0 || downOthers.length > 0) && (
                        <section className="award-downloads" aria-label="다운로드">
                            <div className="award-downloads-title">Downloads</div>

                            <div className="award-files">
                                {downImages.map((file, i) => (
                                    <a key={`${award.id}-down-img-${i}`} href={file.url} target="_blank" rel="noreferrer" className="award-file-link">
                                        {getFileLabel(file)}
                                    </a>
                                ))}

                                {downPdfs.map((file, i) => (
                                    <a key={`${award.id}-down-pdf-${i}`} href={file.url} target="_blank" rel="noreferrer" className="award-file-link">
                                        {getFileLabel(file)}
                                    </a>
                                ))}

                                {downOthers.map((file, i) => (
                                    <a key={`${award.id}-down-etc-${i}`} href={file.url} target="_blank" rel="noreferrer" className="award-file-link">
                                        {getFileLabel(file)}
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </article>
    );
}

export function AwardsPage() {
    const [openId, setOpenId] = useState(null);

    const sortedAwards = useMemo(() => {
        return [...awards].sort((a, b) => b.date.localeCompare(a.date));
    }, []);

    const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

    const rows = useMemo(() => {
        const out = [];
        let prevMonth = null;

        for (const award of sortedAwards) {
            const monthKey = award.date.slice(0, 7);
            const monthLabel = monthKey.replace("-", ".");

            if (monthKey !== prevMonth) {
                out.push({
                    type: "divider",
                    key: `div-${monthKey}`,
                    label: monthLabel,
                });
                prevMonth = monthKey;
            }

            out.push({
                type: "card",
                key: award.id,
                award,
            });
        }

        return out;
    }, [sortedAwards]);

    return (
        <Layout>
            <header className="awards-header">
                <h2 className="awards-title">{siteText.awards.title}</h2>
                <p className="awards-description">{siteText.awards.description}</p>
            </header>

            <div className="awards-grid">
                {rows.map((row) => {
                    if (row.type === "divider") {
                        return (
                            <div key={row.key} className="awards-divider" aria-hidden="true">
                                <span className="awards-divider-text">{row.label}</span>
                            </div>
                        );
                    }

                    return <AwardCard key={row.key} award={row.award} expanded={openId === row.award.id} onToggle={toggle} />;
                })}
            </div>
        </Layout>
    );
}
