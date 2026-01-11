import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlumNode | Alumni Data Management",
  description: "Advanced Alumni Data Management & Analytics Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="main-header">
          <div className="container">
            <div className="logo">
              <span className="logo-icon">A</span>
              <span className="logo-text">Alum<span>Node</span></span>
            </div>
            <nav>
              <a href="/">Dashboard</a>
              <a href="/projects">Projects</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <style dangerouslySetInnerHTML={{
          __html: `
          .main-header {
            background: var(--card);
            border-bottom: 1px solid var(--border);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 700;
            font-size: 1.25rem;
          }
          .logo-icon {
            background: var(--primary);
            color: white;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-size: 1rem;
          }
          .logo-text span {
            color: var(--primary);
          }
          nav {
            display: flex;
            gap: 2rem;
          }
          nav a {
            font-weight: 500;
            color: var(--secondary);
            font-size: 0.875rem;
            transition: color 0.2s;
          }
          nav a:hover {
            color: var(--primary);
          }
          main {
            padding: 2rem 0;
            min-height: calc(100vh - 65px);
          }
        ` }} />
      </body>
    </html>
  );
}
