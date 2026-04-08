import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import profileImg from "../../assets/profile.gif";
import "./Layout.css";

export function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="app-page">
            <div className="app-shell">
                <aside className="app-sidebar">
                    <div className="app-sidebar-header">
                        <div className="app-logo">
                            <span className="app-logo-mark">KJY</span>
                            <span className="app-logo-text">Portfolio</span>
                        </div>

                        <div className="app-profile">
                            <img src={profileImg} alt="Profile" className="app-profile-image" />

                            <div className="app-profile-name">Juyoung Kim</div>

                            <div className="app-profile-desc">
                                Master's Student, CSE
                                <br />
                                <a href="https://www.gnu.ac.kr/" target="_blank" rel="noreferrer" className="app-profile-univ">
                                    Gyeongsang National University
                                </a>
                            </div>
                        </div>
                    </div>

                    <nav className="app-nav">
                        {siteConfig.navItems.map((item) => {
                            const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

                            return (
                                <Link key={item.path} to={item.path} className={"app-nav-link" + (isActive ? " app-nav-link-active" : "")}>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <footer className="app-sidebar-footer">
                        <div className="app-sidebar-footer-contact">
                            Contact
                            <a href="mailto:your_email@example.com" className="app-sidebar-footer-link">
                                ymail3@naver.com
                            </a>
                            <a href="mailto:wndudwkd003@gnu.ac.kr" className="app-sidebar-footer-link">
                                wndudwkd003@gnu.ac.kr
                            </a>
                        </div>

                        <span className="app-sidebar-footer-text">
                            © {new Date().getFullYear()} Juyoung Kim
                            <br />
                            Assisted by ChatGPT.
                        </span>
                    </footer>
                </aside>

                <main className="app-main">{children}</main>
            </div>
        </div>
    );
}
