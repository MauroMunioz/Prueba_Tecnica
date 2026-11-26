import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Inventario',
    template: '%s | pretrabajo',
  },
  description: 'Gestion de inventario de productos',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
            <span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white">
              P
            </span>
            <span className="font-semibold text-slate-900">pretrabajo</span>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
