import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcanalyse - D&D Encounter Analysis",
  description:
    "Find out how deadly your encounter really is. Heuristics + Monte Carlo simulation for D&D 5e.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          src="https://arcanalyse-analytics.wediga.dev/script.js"
          data-website-id="95dc7b4b-08bb-475a-abb1-b12a0f1acde8"
        />
      </head>
      <body className={`${cinzel.variable} ${outfit.variable} antialiased`}>
        {/* Ambient background animation */}
        <div className="ambient-bg" aria-hidden="true">
          <div className="ambient-orb ambient-orb--gold-1" />
          <div className="ambient-orb ambient-orb--purple" />
          <div className="ambient-orb ambient-orb--gold-2" />
          <div className="ambient-orb ambient-orb--crimson" />
        </div>

        {/* Noise texture overlay via CSS background */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Page content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
