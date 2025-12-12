// src/routes/AwardsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Layout } from "../components/layout/Layout";
import { awards } from "../data/awards";

const DEFAULT_IMAGE_EXTS = ["jpg", "png", "jpeg", "webp"];

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

function normalizeAward(award) {
  const dir = `/awards/${award.id}`;

  const count = award.images?.count || 0;
  const exts = award.images?.exts || DEFAULT_IMAGE_EXTS;

  const images = Array.from({ length: count }, (_, i) => ({
    type: "image",
    base: `${dir}/a${i + 1}`,
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

function SmartImage({ base, exts, alt, className, onClick }) {
  const [k, setK] = useState(0);
  const [dead, setDead] = useState(false);

  useEffect(() => {
    setK(0);
    setDead(false);
  }, [base]);

  if (dead) {
    return <span className={className}>FILE</span>;
  }

  const src = `${base}.${exts[k]}`;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => {
        if (k < exts.length - 1) setK(k + 1);
        else setDead(true);
      }}
    />
  );
}

function AwardCard({ award, expanded, onToggle }) {
  const normalized = useMemo(() => normalizeAward(award), [award]);

  const { images, downImages, downPdfs, downOthers } = useMemo(
    () => splitFiles(normalized.fileList),
    [normalized.fileList]
  );

  const [idx, setIdx] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState(null);

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
      <button
        type="button"
        className="award-card-head"
        onClick={() => onToggle(award.id)}
        aria-expanded={expanded}
      >
        <div className="award-thumb-wrapper">
          {images.length > 0 ? (
            <SmartImage
              base={images[0].base}
              exts={images[0].exts}
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

          {award.description && award.description.trim().length > 0 && (
            <p className="award-text">{award.description}</p>
          )}

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

        <span className={`award-toggle-icon ${expanded ? "is-open" : ""}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="award-expand">
          {lightboxUrl &&
            createPortal(
              <div
                className="award-lightbox-overlay"
                onClick={() => setLightboxUrl(null)}
              >
                <div
                  className="award-lightbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="award-lightbox-close"
                    onClick={() => setLightboxUrl(null)}
                    aria-label="닫기"
                  >
                    ×
                  </button>
                  <img
                    src={lightboxUrl}
                    alt="확대 이미지"
                    className="award-lightbox-img"
                  />
                </div>
              </div>,
              document.body
            )}

          {hasSlider && (
            <section className="award-slider" aria-label="증서 이미지 슬라이더">
              <div className="award-slider-stage">
                <SmartImage
                  base={images[idx].base}
                  exts={images[idx].exts}
                  alt={`${award.title} 이미지 ${idx + 1}`}
                  className="award-slider-img"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxUrl(e.currentTarget.src);
                  }}
                />

                {images.length > 1 && (
                  <div className="award-slider-controls">
                    <button
                      type="button"
                      className="award-slider-btn"
                      onClick={goPrev}
                      disabled={idx === 0}
                      aria-label="이전 이미지"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="award-slider-btn"
                      onClick={goNext}
                      disabled={idx === images.length - 1}
                      aria-label="다음 이미지"
                    >
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

          {(downImages.length > 0 ||
            downPdfs.length > 0 ||
            downOthers.length > 0) && (
              <section className="award-downloads" aria-label="다운로드">
                <div className="award-downloads-title">Downloads</div>

                <div className="award-files">
                  {downImages.map((file, i) => (
                    <a
                      key={`${award.id}-down-img-${i}`}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="award-file-link"
                    >
                      {getFileLabel(file)}
                    </a>
                  ))}

                  {downPdfs.map((file, i) => (
                    <a
                      key={`${award.id}-down-pdf-${i}`}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="award-file-link"
                    >
                      {getFileLabel(file)}
                    </a>
                  ))}

                  {downOthers.map((file, i) => (
                    <a
                      key={`${award.id}-down-etc-${i}`}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="award-file-link"
                    >
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
        <h2 className="awards-title">Awards</h2>
        <p className="awards-description">
          대회 수상, 성적 등을 정리한 페이지입니다.
        </p>
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

          return (
            <AwardCard
              key={row.key}
              award={row.award}
              expanded={openId === row.award.id}
              onToggle={toggle}
            />
          );
        })}
      </div>
    </Layout>
  );
}
