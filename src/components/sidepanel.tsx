'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SidePanel() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Set collapsed state based on current path
  useEffect(() => {
    // Expanded by default on homepage, collapsed on other pages
    setIsCollapsed(pathname !== '/');
  }, [pathname]);

  return (
    <div className="relative h-screen sticky top-0 flex-shrink-0">
      {/* Toggle button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 right-0 transform translate-x-1/2 z-10 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-600 transition-colors leading-none"
        aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
      >
        <span className="inline-block translate-y-[-1px]">
          {isCollapsed ? '❯' : '❮'}
        </span>
      </button>
      
      <aside 
        className={`bg-gray-800 text-white h-full overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed 
            ? 'w-16 p-3' 
            : 'w-64 p-6'
        }`}
      >
        <nav className="space-y-4">
          <h2 className={`text-xl font-semibold ${isCollapsed ? 'sr-only' : ''}`}>Navigation</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">home</span>
                {!isCollapsed && <span className="ml-2">Home</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/sizeMatch" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">straighten</span>
                {!isCollapsed && <span className="ml-2">Size Match</span>}
              </Link>
            </li>
          </ul>
          
          <h2 className={`text-xl font-semibold mt-6 ${isCollapsed ? 'sr-only' : ''}`}>Drops</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/products?drop=1" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">inventory_2</span>
                {!isCollapsed && <span className="ml-2">Drop 1</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/products?drop=2" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">inventory_2</span>
                {!isCollapsed && <span className="ml-2">Drop 2</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/products?drop=3" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">inventory_2</span>
                {!isCollapsed && <span className="ml-2">Drop 3</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/products?drop=4" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">inventory_2</span>
                {!isCollapsed && <span className="ml-2">Drop 4</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/products?drop=5" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">inventory_2</span>
                {!isCollapsed && <span className="ml-2">Drop 5</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/products?drop=unsorted" 
                className={`hover:text-gray-300 flex items-center ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className="material-icons text-xl">category</span>
                {!isCollapsed && <span className="ml-2">Unsorted</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
} 