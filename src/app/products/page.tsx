import { Suspense } from 'react';
import ProductsContent from './components/ProductsContent';

export default function ProductsPage() {
  return (
    <Suspense 
      fallback={
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
} 