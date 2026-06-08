import type { Metadata } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansTC = Noto_Sans_TC({ subsets: ["latin"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: "ML Algorithms API Platform",
  description: "Learn Top 10 Machine Learning Algorithms Dynamically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${inter.variable} ${notoSansTC.variable} antialiased bg-[#0f172a] text-slate-200 min-h-screen flex selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        <Sidebar />
        <main className="ml-80 flex-1 relative">
          {/* Background animation layer */}
          <div className="fixed inset-0 pointer-events-none z-[-1] ml-80 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
            <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[80%] h-[80%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
