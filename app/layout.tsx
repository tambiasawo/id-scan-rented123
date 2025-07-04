import type { Metadata } from "next";
import "./globals.css";
import Header from "./_components/Header/Header";

export const metadata: Metadata = {
  title: "ID Verification | Rented123",
  description: "Scan your ID and verify yourself ",
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
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {" "}
        <Header />
        {children}
      </body>
    </html>
  );
}
