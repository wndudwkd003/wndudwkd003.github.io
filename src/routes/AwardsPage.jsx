import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Layout } from "../components/layout/Layout";
import { awards } from "../data/awards";

function splitFiles(fileList) {
    const images = [];
    const pdfs = [];
    const others = [];

    const downImages = [];
    const downPdfs = [];
    const downOthers = [];

    (fileList || []).forEach((f) => {
        const isDown = f.down === true; // down 없으면 false

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
    const url = file.url || "";
    const name = url.split("/").pop() || "file";
    return name;
}

function AwardCard({ award, expanded, onToggle }) {
    const { images, pdfs, others, downImages, downPdfs, downOthers } = useMemo(() => splitFiles(award.fileList), [award.fileList]);

    const thumbUrl = images.length > 0 ? images[0].url : null;

    const [idx, setIdx] = useState(0);

    const [lightboxUrl, setLightboxUrl] = useState(null);
    const openLightbox = (url) => setLightboxUrl(url);
    const closeLightbox = () => setLightboxUrl(null);

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
            {/* 카드 헤더(눌러서 펼치기) */}
            <button type="button" className="award-card-head" onClick={() => onToggle(award.id)} aria-expanded={expanded}>
                <div className="award-thumb-wrapper">
                    {thumbUrl ? <img src={thumbUrl} alt={`${award.title} 썸네일`} className="award-thumb" /> : <span className="award-thumb-placeholder">FILE</span>}
                </div>

                <div className="award-content">
                    <div className="award-meta">
                        {award.displayDate}
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

            {/* 펼쳐지는 영역 */}
            {expanded && (
                <div className="award-expand">
                    {lightboxUrl &&
                        createPortal(
                            <div className="award-lightbox-overlay" onClick={closeLightbox}>
                                <div className="award-lightbox" onClick={(e) => e.stopPropagation()}>
                                    <button type="button" className="award-lightbox-close" onClick={closeLightbox} aria-label="닫기">
                                        ×
                                    </button>
                                    <img src={lightboxUrl} alt="확대 이미지" className="award-lightbox-img" />
                                </div>
                            </div>,
                            document.body
                        )}

                    {/* 이미지 슬라이더 */}
                    {hasSlider && (
                        <section className="award-slider" aria-label="증서 이미지 슬라이더">
                            <div className="award-slider-stage">
                                <img
                                    src={images[idx].url}
                                    alt={`${award.title} 이미지 ${idx + 1}`}
                                    className="award-slider-img"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(images[idx].url);
                                    }}
                                />

                                {images.length > 1 && (
                                    <div className="award-slider-controls">
                                        <button type="button" className="award-slider-btn" onClick={goPrev} disabled={idx === 0} aria-label="이전 이미지">
                                            ‹
                                        </button>
                                        <button type="button" className="award-slider-btn" onClick={goNext} disabled={idx === images.length - 1} aria-label="다음 이미지">
                                            ›
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
                                            onClick={() => setIdx(i)}
                                            aria-label={`${i + 1}번 이미지 보기`}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* 다운로드 섹션(이미지 원본/PDF 등) */}
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

    const sortedAwards = [...awards].sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });

    const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

    return (
        <Layout>
            <header className="awards-header">
                <h2 className="awards-title">Awards</h2>
                <p className="awards-description">수상, 장학금, 대회 성적 등을 정리한 페이지입니다.</p>
            </header>
            <div className="awards-grid">
                {sortedAwards.map((award) => (
                    <AwardCard key={award.id} award={award} expanded={openId === award.id} onToggle={toggle} />
                ))}
            </div>
        </Layout>
    );
}
