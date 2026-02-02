'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Páginas que não devem mostrar o sidebar
  const pagesWithoutSidebar = ['/pages/login'];
  const shouldShowSidebar = !pagesWithoutSidebar.includes(pathname);

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}