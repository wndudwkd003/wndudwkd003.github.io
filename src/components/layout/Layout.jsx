import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import siteText from "../../data/siteText.json";
import "./Layout.css";

export function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="app-page">
            <div className="app-shell">
                <header className="app-header">
                    <Link to="/" className="app-brand">
                        <span className="app-brand-mark">
                            <img src="/github128.png" alt="" className="app-brand-icon" />
                        </span>
                        <div className="app-brand-copy">
                            <p className="app-brand-title">{siteText.layout.brandTitle}</p>
                            <p className="app-brand-subtitle">{siteText.layout.brandSubtitle}</p>
                        </div>
                    </Link>

                    <nav className="app-nav" aria-label="Primary">
                        {siteConfig.navItems.map((item, index) => {
                            const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

                            return (
                                <Link key={item.path} to={item.path} className={`app-nav-link${isActive ? " is-active" : ""}`}>
                                    <span className="app-nav-index">{String(index + 1).padStart(2, "0")}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </header>

                <main className="app-main">{children}</main>
            </div>
        </div>
    );
}
