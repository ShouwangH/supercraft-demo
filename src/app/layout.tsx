import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Supercraft Demo',
  description: 'Photo-to-2.5D Product Placement Demo',
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
