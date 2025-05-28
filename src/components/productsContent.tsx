'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useDropContext } from '@/contexts/DropContext';

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
  price: string | number;
};

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const dropParam = searchParams?.get('drop') ?? null;
  const { rawItems, loading, error } = useDropContext();
  
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [itemsToShow, setItemsToShow] = useState<number>(4);

  // Add this new useEffect to reset filters when drop changes
  useEffect(() => {
    setSelectedType('');
    setSelectedColor('');
    setItemsToShow(4); // Reset items to show when drop changes
  }, [dropParam]); // Reset filters whenever dropParam changes

  // Reset pagination when filters change
  useEffect(() => {
    setItemsToShow(4);
  }, [selectedType, selectedColor]);

  // Process rawItems into groupedItems whenever rawItems changes
  useEffect(() => {
    if (rawItems.length > 0) {
      const grouped = Object.values(rawItems.reduce((acc: Record<string, GroupedItem>, item: SheetItem) => {
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
            dropNumber: item['Drop #'],
            price: item['Variant Price'] || 'N/A'
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
    }
  }, [rawItems]);

  // Get unique types and colors
  const uniqueTypes = Array.from(new Set(groupedItems.map(item => item.type))).filter(Boolean).sort();
  const uniqueColors = Array.from(
    new Set(
      groupedItems
        .flatMap(item => item.variants.map(v => v.option2))
        .filter(Boolean)
    )
  ).sort();

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

  // Add toggle function
  const toggleDescription = (handle: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(handle)) {
        newSet.delete(handle);
      } else {
        newSet.add(handle);
      }
      return newSet;
    });
  };

  const toggleVariants = (handle: string) => {
    setExpandedVariants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(handle)) {
        newSet.delete(handle);
      } else {
        newSet.add(handle);
      }
      return newSet;
    });
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
        <h2 className="text-2xl font-bold text-red-600 mb-4 min-h-[56px]">Error</h2>
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
            {filteredItems.slice(0, itemsToShow).map((item) => (
              <div 
                key={item.handle} 
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {item.images.length > 0 && (
                  <div className="relative w-full h-[486px]">
                    <Image 
                      src={item.images[0]} 
                      alt={item.title || 'Product image'} 
                      fill
                      sizes="(max-width: 768px) 100vw, 486px"
                      className="object-cover object-center"
                      priority
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  {item.price && (
                    <p className="text-lg font-medium text-blue-600 mb-2">
                      ${item.price}
                    </p>
                  )}
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
                  
                  <h3 
                    className="font-medium text-lg my-2 cursor-pointer hover:text-blue-600 flex items-center gap-2"
                    onClick={() => toggleDescription(item.handle)}
                  >
                    Description
                    <span className="material-icons text-sm">
                      {expandedDescriptions.has(item.handle) ? 'expand_less' : 'expand_more'}
                    </span>
                  </h3>
                  
                  {expandedDescriptions.has(item.handle) && (
                    <div 
                      className="text-sm text-gray-600 mb-4 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.body_html }}
                    />
                  )}

                  {item.variants.length > 0 && (
                    <div className="mt-4">
                      <h3 
                        className="font-medium text-lg mb-2 cursor-pointer hover:text-blue-600 flex items-center gap-2"
                        onClick={() => toggleVariants(item.handle)}
                      >
                        Variants ({item.variants.length})
                        <span className="material-icons text-sm">
                          {expandedVariants.has(item.handle) ? 'expand_less' : 'expand_more'}
                        </span>
                      </h3>
                      
                      {expandedVariants.has(item.handle) && (
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
                      )}
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
            {/* Load More Button */}
            {itemsToShow < filteredItems.length && (
              <div className="mt-8">
                <button
                  onClick={() => setItemsToShow(prev => prev + 4)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Load More ({Math.min(4, filteredItems.length - itemsToShow)} more items)
                </button>
              </div>
            )}
          </div>    
        )}
      </div>
    </>
  );
} 