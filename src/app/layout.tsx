import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'EquiSettle',
  description: 'Shared expenses and zero-gas settlement on Sui',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={cn(inter.className, "bg-slate-50 text-slate-900 antialiased")}>
        <Providers>
          <div className="mx-auto max-w-md h-[100dvh] sm:h-[95dvh] overflow-hidden bg-white sm:shadow-2xl sm:rounded-[2rem] sm:my-[2.5dvh] flex flex-col relative border-x sm:border-y border-slate-100">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
