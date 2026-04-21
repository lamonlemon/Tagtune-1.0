import './globals.css';
import { NextAuthProvider } from '@/components/NextAuthProvider';

export const metadata = {
  title: 'TagTune',
  description: 'Tag-based music playlist generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
