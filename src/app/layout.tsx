import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Text to PDF — Fast, Private & Beautiful',
  description:
    'Convert text to beautifully formatted PDFs right in your browser. Fully private, no server upload, with custom fonts, margins, watermarks, and live preview.',
  keywords: ['text to pdf', 'pdf generator', 'convert text', 'pdf maker', 'free pdf tool'],
  authors: [{ name: 'Text to PDF' }],
  openGraph: {
    title: 'Text to PDF — Fast, Private & Beautiful',
    description: 'Convert text to beautifully formatted PDFs, fully in your browser.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

// Prevent theme flash before hydration
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('textpdf_theme');
    var theme = stored ? JSON.parse(stored) : 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
