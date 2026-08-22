import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/auth-context';
import AppLayout from '../components/AppLayout';

export const metadata: Metadata = {
  title: 'Śiṣya Abhyāsa | AI-Powered Collaborative Engineering & Proof-of-Work',
  description: 'Learn · Build · Collaborate · Prove verified engineering skills with GitHub evidence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
