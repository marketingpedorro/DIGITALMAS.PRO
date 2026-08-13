import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C001 Kixiki Lanches",
  description: "Xis Gaúcho e marmitas com tempero caseiro em Santo Antônio de Lisboa, Florianópolis.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
