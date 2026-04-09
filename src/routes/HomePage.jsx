import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { projects } from "../data/projects";
import { publications } from "../data/publications";
import { awards } from "../data/awards";
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
    const latestPublication = getLatestByDate(publications);
    const latestAward = getLatestByDate(awards);
    const photoSrc = normalizePhotoSrc(siteText.home.photo.imagePath);
    const statValueMap = {
        publications: publications.length,
        projects: projects.length,
        activities: awards.length,
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
                            <div className="home-photo-frame">
                                <img
                                    src={photoSrc}
                                    alt={`${siteText.home.profile.name} profile`}
                                    className="home-photo-image"
                                />
                            </div>
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

                        <div className="home-stat-grid">
                            {siteText.home.stats.map((item) => (
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
            </div>
        </Layout>
    );
}
