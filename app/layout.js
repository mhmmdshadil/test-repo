import "./globals.css";

export const metadata = {
  title: "Universal Emergency ID — Biometric Medical Access",
  description: "Hospital emergency patient identification system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-midnight text-white font-body antialiased">{children}</body>
    </html>
  );
}
