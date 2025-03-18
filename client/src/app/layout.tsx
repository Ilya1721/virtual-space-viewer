import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Space Viewer",
  description: "Walk through virtual spaces using Matterport SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
