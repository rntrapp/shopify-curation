import { Suspense } from 'react';
import SizeMatchContent from '../../components/sizeMatchContent';

export default function SizeMatchPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <SizeMatchContent />
    </Suspense>
  );
} 