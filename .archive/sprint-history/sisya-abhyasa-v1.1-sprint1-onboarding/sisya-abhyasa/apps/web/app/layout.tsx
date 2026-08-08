import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Śiṣya Abhyāsa', description: 'Learn · Build · Collaborate · Prove' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
