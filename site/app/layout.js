import "./globals.css";
export const metadata = { title: "Signal Brief", description: "AI, briefly. For leaders." };
export const viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#0e0e10" }] };
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
