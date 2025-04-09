'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

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

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const dropParam = searchParams?.get('drop') ?? null;
  
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Add this new useEffect to reset filters when drop changes
  useEffect(() => {
    setSelectedType('');
    setSelectedColor('');
  }, [dropParam]); // Reset filters whenever dropParam changes

  // Get unique types and colors
  const uniqueTypes = Array.from(new Set(groupedItems.map(item => item.type))).filter(Boolean).sort();
  const uniqueColors = Array.from(
    new Set(
      groupedItems
        .flatMap(item => item.variants.map(v => v.option2))
        .filter(Boolean)
    )
  ).sort();

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const response = await fetch('/api/sheets');
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        const grouped = Object.values(data.items.reduce((acc: Record<string, GroupedItem>, item: SheetItem) => {
          const handle = item.Handle;
          
          if (!acc[handle]) {
            acc[handle] = {
              handle: handle,
              title: item.Title,
              body_html: item['Body (HTML)'],
              type: item.Type,
              tags: item.Tags,
              image: item['Image Src'],
              images: [],
              variants: [],
              dropNumber: item['Drop #']
            };
          }

          if (item['Image Src'] && !acc[handle].images.includes(item['Image Src'])) {
            acc[handle].images.push(item['Image Src']);
          }

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

        setGroupedItems(grouped as GroupedItem[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Filter grouped items based on all filters
  const filteredItems = groupedItems.filter(item => {
    // Drop filter
    if (dropParam === 'unsorted' && (item.dropNumber || item.dropNumber === '')) {
      return false;
    }
    if (dropParam && dropParam !== 'unsorted' && String(item.dropNumber) !== dropParam) {
      return false;
    }
    
    // Type filter
    if (selectedType && item.type !== selectedType) {
      return false;
    }

    // Color filter
    if (selectedColor && !item.variants.some(v => v.option2 === selectedColor)) {
      return false;
    }

    return true;
  });

  // Add these helper functions before the return statement
  const getTypeCount = (type: string) => {
    return filteredItems.filter(item => item.type === type).length;
  };

  const getColorCount = (color: string) => {
    return filteredItems.filter(item => 
      item.variants.some(v => v.option2 === color)
    ).length;
  };

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

  return (
    <>
      {/* Top Filter Navbar - Always visible */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {dropParam === 'unsorted' 
                ? `Unsorted Items (${filteredItems.length})`
                : dropParam 
                  ? `Drop ${dropParam} Items (${filteredItems.length})` 
                  : `All Items (${filteredItems.length})`
              }
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <label htmlFor="type-filter" className="text-sm font-medium text-gray-600">
                  Type
                </label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
                  className="rounded-lg border border-gray-200 py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[160px]"
                >
                  <option value="">All Types ({filteredItems.length})</option>
                  {uniqueTypes.map((type: string) => (
                    <option key={type} value={type}>
                      {type} ({getTypeCount(type)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="color-filter" className="text-sm font-medium text-gray-600">
                  Color
                </label>
                <select
                  id="color-filter"
                  value={selectedColor}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedColor(e.target.value)}
                  className="rounded-lg border border-gray-200 py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[160px]"
                >
                  <option value="">All Colors ({filteredItems.length})</option>
                  {uniqueColors.map((color: string) => (
                    <option key={color} value={color}>
                      {color} ({getColorCount(color)})
                    </option>
                  ))}
                </select>
              </div>

              {(selectedType || selectedColor) && (
                <button
                  onClick={() => {
                    setSelectedType('');
                    setSelectedColor('');
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
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
        ) : (
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
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">Handle: {item.handle}</p>
                  {item.dropNumber && (
                    <p className="text-sm text-gray-600 mb-2">Drop: {item.dropNumber}</p>
                  )}
                  {item.type && (
                    <p className="text-sm text-gray-600 mb-2">Type: {item.type}</p>
                  )}
                  {item.variants[0]?.option2 && (
                    <p className="text-sm text-gray-600 mb-2">Colour: {item.variants[0].option2}</p>
                  )}
                  
                  {item.variants.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-lg mb-2">Variants ({item.variants.length})</h3>
                      <div className="space-y-2">
                        {item.variants.slice(0, 3).map((variant, idx) => (
                          <div key={variant.sku || idx} className="text-sm border-t pt-2">
                            <p className="font-medium">{variant.sku}</p>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {variant.option1 && (
                                <p>Size: {variant.option1}</p>
                              )}
                              <p>Qty: {variant.inventory_quantity}</p>
                            </div>
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
                  
                  {/* Additional Images Gallery */}
                  {item.images.length > 1 && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium text-sm mb-2">Additional Images</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {item.images.slice(1).map((imgSrc, idx) => (
                          <div key={idx} className="relative w-full aspect-square">
                            <Image
                              src={imgSrc}
                              alt="No image"
                              fill
                              sizes="80px"
                              className="rounded-md object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 