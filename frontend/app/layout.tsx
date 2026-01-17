import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bimoi - Personal Social Graph",
  description: "Explore, model, and understand your relationships with Bimoi - your personal social network visualization tool",
  icons: {
    icon: "/favicon.ico",
    apple: "/bimoi-logo.svg",
  },
  themeColor: "#B41F66",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
