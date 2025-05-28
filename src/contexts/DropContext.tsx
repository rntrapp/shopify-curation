'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type SheetItem = {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  Type: string;
  Tags: string;
  'Image Src': string;
  'Variant SKU': string;
  'Option1 Value': string;
  'Option2 Value': string;
  'Variant Inventory Qty': string;
  'Variant Inventory Quantity': number;
  'Drop #'?: string | number | null;
  'Variant Price': string | number;
};

type DropInfo = {
  dropNumber: string | number;
  count: number;
};

type DropContextType = {
  drops: DropInfo[];
  unsortedCount: number;
  loading: boolean;
  error: string | null;
  rawItems: SheetItem[];
  refetch: () => void;
};

const DropContext = createContext<DropContextType | undefined>(undefined);

export function DropProvider({ children }: { children: ReactNode }) {
  const [rawItems, setRawItems] = useState<SheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/sheets');
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRawItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Calculate drops and counts
  const drops: DropInfo[] = [];
  let unsortedCount = 0;
  const dropCounts: Record<string, number> = {};

  // Group by handle first to count unique products
  const handleToDropMap: Record<string, string | number | null> = {};
  
  rawItems.forEach((item) => {
    const handle = item.Handle;
    const dropNumber = item['Drop #'];
    
    // Only process each handle once (take the first occurrence)
    if (!handleToDropMap.hasOwnProperty(handle)) {
      handleToDropMap[handle] = dropNumber ?? null;
    }
  });

  // Now count unique handles per drop
  Object.values(handleToDropMap).forEach((dropNumber) => {
    if (!dropNumber || dropNumber === '') {
      unsortedCount++;
    } else {
      const dropKey = String(dropNumber);
      dropCounts[dropKey] = (dropCounts[dropKey] || 0) + 1;
    }
  });

  // Convert to array and sort numerically
  Object.entries(dropCounts).forEach(([dropNumber, count]) => {
    drops.push({ dropNumber, count });
  });

  // Sort drops numerically
  drops.sort((a, b) => {
    const numA = parseInt(String(a.dropNumber));
    const numB = parseInt(String(b.dropNumber));
    return numA - numB;
  });

  const contextValue: DropContextType = {
    drops,
    unsortedCount,
    loading,
    error,
    rawItems,
    refetch: fetchItems,
  };

  return (
    <DropContext.Provider value={contextValue}>
      {children}
    </DropContext.Provider>
  );
}

export function useDropContext() {
  const context = useContext(DropContext);
  if (context === undefined) {
    throw new Error('useDropContext must be used within a DropProvider');
  }
  return context;
} 