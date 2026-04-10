import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import siteText from "../../data/siteText.json";
import "./Layout.css";

export function Layout({ children }) {
    const location = useLocation();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const visibleNavItems = siteConfig.navItems.filter((item) => item.path !== "/projects");

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 280);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    };

    return (
        <div className="app-page">
            <div className="app-shell">
                <header className="app-header">
                    <Link to="/" className="app-brand" onClick={scrollToTop}>
                        <span className="app-brand-mark">
                            <img src="/github128.png" alt="" className="app-brand-icon" />
                        </span>
                        <div className="app-brand-copy">
                            <p className="app-brand-title">{siteText.layout.brandTitle}</p>
                            <p className="app-brand-subtitle">{siteText.layout.brandSubtitle}</p>
                        </div>
                    </Link>

                    <nav className="app-nav" aria-label="Primary">
                        {visibleNavItems.map((item, index) => {
                            const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`app-nav-link${isActive ? " is-active" : ""}`}
                                    onClick={item.path === "/" ? scrollToTop : undefined}
                                >
                                    <span className="app-nav-index">{String(index + 1).padStart(2, "0")}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </header>

                <main className="app-main">{children}</main>
            </div>

            <button
                type="button"
                className={`global-scroll-top-button${showScrollTop ? " is-visible" : ""}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg viewBox="0 0 24 24" className="global-scroll-top-button-icon" aria-hidden="true">
                    <path
                        d="M12 18.5v-12m0 0-4.5 4.5M12 6.5l4.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
