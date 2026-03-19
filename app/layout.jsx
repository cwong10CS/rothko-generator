import "./globals.css";

export const metadata = {
  title: "Rothko Art Generator",
  description: "Generate Rothko-style abstract art based on location weather",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
