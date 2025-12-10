import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">
            {siteConfig.title}
          </Link>
          <nav className="flex gap-4 text-sm">
            {siteConfig.navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8">{children}</main>

      <footer className="border-t mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Portfolio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
