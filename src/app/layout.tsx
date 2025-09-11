import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Hub Miniatures",
  description: "Partagez des propositions et récoltez des likes/dislikes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-5xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Client Hub Miniatures</h1>
            <a className="underline opacity-70 hover:opacity-100" href="/">Dashboard</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
