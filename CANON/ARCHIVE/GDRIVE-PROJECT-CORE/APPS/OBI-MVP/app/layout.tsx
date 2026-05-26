import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OBI — English Speaking System",
  description: "AI English tutor with accountability and memory",
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
