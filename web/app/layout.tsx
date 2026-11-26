import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Boxes } from 'lucide-react';
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
    default: 'Inventario | TensorTec',
    template: '%s | TensorTec',
  },
  description: 'Gestión de inventario de productos de TensorTec',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-100/70 text-slate-900">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          {/* Franja con los dos colores del logo */}
          <div className="h-1 bg-linear-to-r from-brand-800 via-brand-700 to-accent-500" />
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            >
              {/* unoptimized: es un PNG chico y asi no depende del optimizador en el contenedor */}
              <Image
                src="/tensortec-logo.png"
                alt="TensorTec"
                width={1098}
                height={481}
                priority
                unoptimized
                className="h-12 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-brand-800">
              <Boxes className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Gestión de inventario</span>
            </div>
          </div>
        </header>

        {children}

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              <span className="font-semibold text-brand-800">TensorTec</span> · Transformando ideas en
              innovación
            </p>
            <p>Sistema de gestión de inventario</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
