import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = "https://n8n-openapi.vercel.app";

export const metadata: Metadata = {
  title: "OpenAPI to n8n Converter - Transform API Specs to n8n Workflows",
  description:
    "Free online tool to convert OpenAPI/Swagger specifications to n8n HTTP Request nodes. Easily transform your API definitions into ready-to-use n8n workflow nodes.",
  keywords: [
    "OpenAPI",
    "Swagger",
    "n8n",
    "API converter",
    "workflow automation",
    "HTTP nodes",
    "API integration",
    "no-code automation",
    "OpenAPI to n8n",
    "Swagger converter",
  ],
  authors: [{ name: "n8n-openapi" }],
  creator: "n8n-openapi",
  publisher: "n8n-openapi",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "OpenAPI to n8n Converter",
    title: "OpenAPI to n8n Converter - Transform API Specs to n8n Workflows",
    description:
      "Free online tool to convert OpenAPI/Swagger specifications to n8n HTTP Request nodes. Transform your API definitions into ready-to-use n8n workflow nodes.",
    images: [
      {
        url: "/screen.png",
        width: 1200,
        height: 630,
        alt: "OpenAPI to n8n Converter Screenshot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenAPI to n8n Converter",
    description:
      "Convert OpenAPI/Swagger specs to n8n HTTP nodes instantly. Free online tool for workflow automation.",
    images: ["/screen.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5288G9LZRG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5288G9LZRG');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
