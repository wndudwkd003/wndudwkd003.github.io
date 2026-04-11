import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { projects } from "../data/projects";
import { publications } from "../data/publications";
import { awards } from "../data/awards";
import { RESEARCH_STAGE_ID, ResearchShowcase } from "../components/home/ResearchShowcase";
import researchHighlights from "../data/researchHighlights.json";
import siteText from "../data/siteText.json";

function getLatestByDate(items) {
    return [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0] || null;
}

function formatDate(date) {
    if (!date) return "Archive";
    return date.slice(0, 7).replace("-", ".");
}

function normalizePhotoSrc(path) {
    if (!path) return "";

    const normalized = path.replace(/\\/g, "/").trim();
    if (!normalized) return "";
    if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("/")) {
        return normalized;
    }
    if (normalized.startsWith("public/")) {
        return `/${normalized.slice("public/".length)}`;
    }
    return `/${normalized}`;
}

export function HomePage() {
    const navigate = useNavigate();
    const latestPublication = getLatestByDate(publications);
    const latestAward = getLatestByDate(awards);
    const photoSrc = normalizePhotoSrc(siteText.home.photo.imagePath);
    const certificateCount = Array.isArray(siteText.other.certificates?.items) ? siteText.other.certificates.items.length : 0;
    const visibleStats = siteText.home.stats.filter((item) => item.hidden !== true);
    const [photoClickCount, setPhotoClickCount] = useState(0);
    const [photoHint, setPhotoHint] = useState("");
    const statValueMap = {
        publications: publications.length,
        projects: projects.length,
        certificates: certificateCount,
        activities: awards.length,
    };

    useEffect(() => {
        if (!photoHint) return undefined;

        const timer = window.setTimeout(() => {
            setPhotoHint("");
        }, 1800);

        return () => window.clearTimeout(timer);
    }, [photoHint]);

    useEffect(() => {
        if (photoClickCount < 1 || photoClickCount >= 5) return undefined;

        const resetTimer = window.setTimeout(() => {
            setPhotoClickCount(0);
            setPhotoHint("");
        }, 5000);

        return () => window.clearTimeout(resetTimer);
    }, [photoClickCount]);

    const handlePhotoClick = () => {
        const nextCount = photoClickCount + 1;
        setPhotoClickCount(nextCount);

        if (nextCount === 3) {
            setPhotoHint("2번 남았습니다.");
            return;
        }

        if (nextCount === 4) {
            setPhotoHint("1번 남았습니다.");
            return;
        }

        if (nextCount >= 5) {
            setPhotoHint("");
            navigate("/hidden");
        }
    };

    const scrollToResearchShowcase = () => {
        const target = document.getElementById(RESEARCH_STAGE_ID);
        if (!target) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const header = document.querySelector(".app-header");
        const headerHeight = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: prefersReducedMotion ? "auto" : "smooth",
        });
    };

    return (
        <Layout>
            <div className="home-page">
                <section className="home-hero">
                    <div className="home-hero-copy">
                        <h2 className="home-hero-title">{siteText.home.title}</h2>
                        <p className="home-hero-lead">
                            {siteText.home.leadLines[0]}
                            <br />
                            {siteText.home.leadLines[1]}
                        </p>
                    </div>

                    <div className={`home-photo-slot ${photoSrc ? "has-image" : ""}`} aria-label="Profile photo area">
                        {photoSrc ? (
                            <button
                                type="button"
                                className="home-photo-trigger"
                                onClick={handlePhotoClick}
                                aria-label={`${siteText.home.profile.name} profile secret trigger`}
                            >
                                <div className="home-photo-frame">
                                    <img
                                        src={photoSrc}
                                        alt={`${siteText.home.profile.name} profile`}
                                        className="home-photo-image"
                                    />
                                </div>
                            </button>
                        ) : (
                            <div className="home-photo-slot-inner">
                                <span className="home-photo-slot-label">{siteText.home.photo.label}</span>
                                <p className="home-photo-slot-copy">{siteText.home.photo.copy}</p>
                            </div>
                        )}
                    </div>

                    <aside className="home-note">
                        <p className="home-note-label">{siteText.home.profile.label}</p>
                        <div className="home-note-profile">
                            <p className="home-note-name">{siteText.home.profile.name}</p>
                            <p className="home-note-copy">
                                {siteText.home.profile.roleLines[0]}
                                <br />
                                {siteText.home.profile.roleLines[1]}
                            </p>
                            <p className="home-note-meta">
                                <span className="home-note-university">{siteText.home.profile.universityLabel}</span>
                                <span className="home-note-meta-separator">·</span>
                                <span className="home-note-location">{siteText.home.profile.locationLabel}</span>
                            </p>
                        </div>

                        <div className="home-stat-grid" style={{ "--home-stat-count": visibleStats.length }}>
                            {visibleStats.map((item) => (
                                <div key={item.key} className="home-stat-card">
                                    <span className="home-stat-value">{statValueMap[item.key]}</span>
                                    <span className="home-stat-label">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="home-focus-row">
                            <p className="home-focus-label">{siteText.home.focus.label}</p>
                            <div className="home-focus-tags">
                                {siteText.home.focus.tags.map((tag) => (
                                    <span key={tag} className="home-focus-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="home-grid" aria-label="Recent highlights">
                    <article className="home-feature">
                        <div className="home-feature-heading">
                            <p className="home-feature-label">{siteText.home.recentPublication.label}</p>
                            <h3 className="home-feature-title">{latestPublication?.title || siteText.home.recentPublication.fallbackTitle}</h3>
                        </div>
                        <p className="home-feature-meta">
                            {formatDate(latestPublication?.date)}
                            {latestPublication?.venue ? ` / ${latestPublication.venue}` : ""}
                        </p>
                        <p className="home-feature-copy">
                            {latestPublication?.note || siteText.home.recentPublication.fallbackCopy}
                        </p>
                        <Link to="/publications" className="home-feature-link">
                            {siteText.home.recentPublication.linkLabel}
                        </Link>
                    </article>

                    <article className="home-feature">
                        <div className="home-feature-heading">
                            <p className="home-feature-label">{siteText.home.recentActivity.label}</p>
                            <h3 className="home-feature-title">{latestAward?.title || siteText.home.recentActivity.fallbackTitle}</h3>
                        </div>
                        <p className="home-feature-meta">
                            {formatDate(latestAward?.date)}
                            {latestAward?.org ? ` / ${latestAward.org}` : ""}
                        </p>
                        <p className="home-feature-copy">
                            {latestAward?.description || siteText.home.recentActivity.fallbackCopy}
                        </p>
                        <Link to="/awards" className="home-feature-link">
                            {siteText.home.recentActivity.linkLabel}
                        </Link>
                    </article>
                </section>

                <section className="home-scroll-bridge" aria-label="Scroll to research section">
                    <button
                        type="button"
                        className="home-scroll-button"
                        aria-controls={RESEARCH_STAGE_ID}
                        onClick={scrollToResearchShowcase}
                    >
                        <span className="home-scroll-button-copy">
                            <span className="home-scroll-button-label">{researchHighlights.cta.label}</span>
                            <span className="home-scroll-button-hint">{researchHighlights.cta.hint}</span>
                        </span>
                        <span className="home-scroll-button-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" className="home-scroll-button-icon-svg">
                                <path
                                    d="M12 5.5v12m0 0-4.5-4.5M12 17.5l4.5-4.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </button>
                </section>

                <ResearchShowcase />
                {photoHint ? createPortal(<div className="home-photo-hint">{photoHint}</div>, document.body) : null}
            </div>
        </Layout>
    );
}
