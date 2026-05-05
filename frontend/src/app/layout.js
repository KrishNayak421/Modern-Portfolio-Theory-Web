import { Instrument_Serif, Inter } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "MPT Portfolio Optimizer — Modern Portfolio Theory",
  description:
    "Optimize your investment portfolio using Modern Portfolio Theory. Interactive efficient frontier visualization, correlation analysis, and returns tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
