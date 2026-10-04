import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "字里 · Chinese study",
  description:
    "A personal Chinese study room. Vocabulary, tones, grammar, and listening.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
