'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

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
};

type Variant = {
  sku: string;
  option1: string;
  option2: string;
  inventory_quantity: number;
};

type GroupedItem = {
  handle: string;
  title: string;
  body_html: string;
  type: string;
  tags: string;
  image: string;
  images: string[];
  variants: Variant[];
  dropNumber?: string | number | null;
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const dropParam = searchParams.get('drop');
  
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const response = await fetch('/api/sheets');
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Group items by handle and process the data
        const grouped = Object.values(data.items.reduce((acc: Record<string, GroupedItem>, item: SheetItem) => {
          const handle = item.Handle;
          
          if (!acc[handle]) {
            // Initialize the group with the first item's data
            acc[handle] = {
              handle: handle,
              title: item.Title,
              body_html: item['Body (HTML)'],
              type: item.Type,
              tags: item.Tags,
              image: item['Image Src'],
              images: [], // We'll collect all unique images here
              variants: [], // We'll collect all variants here
              dropNumber: item['Drop #'] // Store the drop number
            };
          }

          // Add images if they exist and are unique
          if (item['Image Src'] && !acc[handle].images.includes(item['Image Src'])) {
            acc[handle].images.push(item['Image Src']);
          }

          // Only add variant if we have variant data (SKU exists)
          if (item['Variant SKU']) {
            acc[handle].variants.push({
              sku: item['Variant SKU'],
              option1: item['Option1 Value'] || '',
              option2: item['Option2 Value'] || '',
              inventory_quantity: parseInt(item['Variant Inventory Qty']) || item['Variant Inventory Quantity'] || 0
            });
          }

          return acc;
        }, {}));

        console.log(grouped);
        setGroupedItems(grouped as GroupedItem[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Filter grouped items based on drop number
  const filteredItems = groupedItems.filter(item => {
    if (dropParam === 'unsorted') {
      // Show items with no drop number or empty drop number
      return !item.dropNumber || item.dropNumber === '';
    }
    
    if (dropParam) {
      // Convert to string for comparison
      return String(item.dropNumber) === dropParam;
    }
    
    // If no drop parameter, show all items
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">
          {dropParam === 'unsorted' 
            ? 'No Unsorted Items' 
            : `No Items in Drop ${dropParam}`}
        </h2>
        <p className="text-gray-600">
          {dropParam === 'unsorted'
            ? 'All items have been assigned to a drop.'
            : 'There are no items assigned to this drop.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">
        {dropParam === 'unsorted' 
          ? 'Unsorted Items' 
          : dropParam 
            ? `Drop ${dropParam} Items (${filteredItems.length})` 
            : `All Items (${filteredItems.length})`
        }
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredItems.map((item) => (
          <div 
            key={item.handle} 
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            {item.images.length > 0 && (
              <div className="relative w-full" style={{ height: '486px', maxWidth: '324px', margin: '0 auto' }}>
                <Image 
                  src={item.images[0]} 
                  alt={item.title || 'Product image'} 
                  fill
                  sizes="324px"
                  style={{ 
                    objectFit: 'cover',
                    objectPosition: 'center' 
                  }}
                  priority
                />
              </div>
            )}
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 min-h-[56px]">{item.title}</h2>
              <p className="text-sm text-gray-600 mb-2">Handle: {item.handle}</p>
              {item.type && (
                <p className="text-sm text-gray-600 mb-2">Type: {item.type}</p>
              )}
              {item.variants.length > 0 && item.variants[0].option2 && (
                <p className="text-sm text-gray-600 mb-2">Color: {item.variants[0].option2}</p>
              )}
              
              {item.variants.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-lg mb-2">Variants ({item.variants.length})</h3>
                  <div className="space-y-2">
                    {item.variants.slice(0, 3).map((variant, idx) => (
                      <div key={variant.sku || idx} className="text-sm border-t pt-2">
                        <p className="font-medium">{variant.sku}</p>
                        <p>
                          {variant.option1 && (
                            <p>Size: {variant.option1}</p>
                          )}
                        </p>
                        <p>Qty: {variant.inventory_quantity}</p>
                      </div>
                    ))}
                    {item.variants.length > 3 && (
                      <p className="text-sm text-gray-500 italic">
                        +{item.variants.length - 3} more variants
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional images thumbnails */}
              {item.images.length > 1 && (
                <div className="mt-4">
                  <h3 className="font-medium text-md mb-2">Other Images</h3>
                  <div className="flex space-x-2 overflow-x-auto">
                    {item.images.slice(1, 4).map((src, idx) => (
                      <div key={idx} className="relative flex-shrink-0" style={{ width: '40px', height: '60px' }}>
                        <Image
                          src={src}
                          alt={`No image`}
                          fill
                          sizes="40px"
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          className="rounded"
                        />
                      </div>
                    ))}
                    {item.images.length > 4 && (
                      <div className="flex-shrink-0 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm" style={{ width: '40px', height: '60px' }}>
                        +{item.images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 