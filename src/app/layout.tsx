import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenAPI to n8n Converter",
  description: "Convert OpenAPI/Swagger specs to n8n HTTP nodes",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
