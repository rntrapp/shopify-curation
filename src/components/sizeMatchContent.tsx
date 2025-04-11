'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

type SheetItem = {
  Handle: string;
  Title: string;
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
  inventory_quantity: number;
};

type GroupedItem = {
  handle: string;
  title: string;
  image: string;
  variants: Variant[];
  images: string[];
  dropNumber?: string | number | null;
};

export default function SizeMatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropParam = searchParams?.get('drop') ?? null;

  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string, number>>({});
  const [mousePositions, setMousePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  // Helper function to generate image URLs with sequential letters
  const generateImageUrls = (baseUrl: string, variantCount: number) => {
    const urls = [baseUrl.replace('a.jpg', 'b.jpg')];
    const startCharCode = 'e'.charCodeAt(0);
    
    for (let i = 1; i < variantCount; i++) {
      const letter = String.fromCharCode(startCharCode + i - 1);
      urls.push(baseUrl.replace('a.jpg', `${letter}.jpg`));
    }
    return urls;
  };

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
              image: item['Image Src'],
              variants: [],
              images: [],
              dropNumber: item['Drop #']
            };
          }

          if (item['Variant SKU'] && item['Option1 Value']) {
            acc[handle].variants.push({
              sku: item['Variant SKU'],
              option1: item['Option1 Value'],
              inventory_quantity: parseInt(item['Variant Inventory Qty']) || item['Variant Inventory Quantity'] || 0
            });
          }

          return acc;
        }, {})) as GroupedItem[];

        // Generate image URLs for each item based on variant count
        const groupedWithImages = grouped.map(item => ({
          ...item,
          images: generateImageUrls(item.image, Math.max(1, item.variants.length))
        }));

        setGroupedItems(groupedWithImages as GroupedItem[]);
        
        // Initialize current image indexes
        const initialIndexes = groupedWithImages.reduce((acc, item) => {
          acc[item.handle] = 0;
          return acc;
        }, {} as Record<string, number>);
        setCurrentImageIndexes(initialIndexes);

        // Initialize loading states
        const initialLoadingStates = groupedWithImages.reduce((acc, item) => {
          acc[item.handle] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setImageLoading(initialLoadingStates);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  const handlePrevImage = (handle: string) => {
    setImageLoading(prev => ({ ...prev, [handle]: true }));
    setTimeout(() => {
      setImageLoading(prev => ({ ...prev, [handle]: false }));
    }, 5000);
    setCurrentImageIndexes(prev => ({
      ...prev,
      [handle]: (prev[handle] - 1 + groupedItems.find(item => item.handle === handle)!.images.length) % 
                groupedItems.find(item => item.handle === handle)!.images.length
    }));
  };

  const handleNextImage = (handle: string) => {
    setImageLoading(prev => ({ ...prev, [handle]: true }));
    setTimeout(() => {
      setImageLoading(prev => ({ ...prev, [handle]: false }));
    }, 5000);
    setCurrentImageIndexes(prev => ({
      ...prev,
      [handle]: (prev[handle] + 1) % groupedItems.find(item => item.handle === handle)!.images.length
    }));
  };

  const handleImageLoad = (handle: string) => {
    console.log('Image loaded for handle:', handle);
    setImageLoading(prev => ({ ...prev, [handle]: false }));
  };

  const handleImageError = (handle: string) => {
    console.error('Image failed to load for handle:', handle);
    setImageLoading(prev => ({ ...prev, [handle]: false }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, handle: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePositions(prev => ({
      ...prev,
      [handle]: { x, y }
    }));
  };

  const handleMouseLeave = (handle: string) => {
    setMousePositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[handle];
      return newPositions;
    });
  };

  // Filter items based on drop
  const filteredItems = groupedItems.filter(item => {
    if (dropParam === 'unsorted' && (item.dropNumber || item.dropNumber === '')) {
      return false;
    }
    if (dropParam && dropParam !== 'unsorted' && String(item.dropNumber) !== dropParam) {
      return false;
    }
    return true;
  });

  const handleDropChange = (drop: string) => {
    router.push(`/sizeMatch${drop ? `?drop=${drop}` : ''}`);
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {dropParam === 'unsorted' 
            ? `Unsorted Items (${filteredItems.length})`
            : dropParam 
              ? `Drop ${dropParam} Items (${filteredItems.length})` 
              : `All Items (${filteredItems.length})`
          }
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={dropParam || ''}
            onChange={(e) => handleDropChange(e.target.value)}
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[160px]"
          >
            <option value="">All Drops</option>
            <option value="1">Drop 1</option>
            <option value="2">Drop 2</option>
            <option value="3">Drop 3</option>
            <option value="4">Drop 4</option>
            <option value="5">Drop 5</option>
            <option value="unsorted">Unsorted</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div 
            key={item.handle} 
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div 
              className="relative w-full h-[486px] overflow-hidden"
              onMouseMove={(e) => handleMouseMove(e, item.handle)}
              onMouseLeave={() => handleMouseLeave(item.handle)}
            >
              {imageLoading[item.handle] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-xl font-semibold text-gray-600">Loading...</p>
                </div>
              ) : null}
              <Image 
                src={item.images[currentImageIndexes[item.handle]]} 
                alt={item.title || 'Product image'} 
                fill
                sizes="(max-width: 768px) 100vw, 486px"
                className={`object-cover object-center transition-transform duration-75 ${
                  imageLoading[item.handle] ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  transform: mousePositions[item.handle] 
                    ? `scale(4) translate(${(50 - mousePositions[item.handle].x) / 4}%, ${(50 - mousePositions[item.handle].y) / 4}%)`
                    : 'scale(1)',
                }}
                priority
                onLoad={() => handleImageLoad(item.handle)}
                onError={() => handleImageError(item.handle)}
              />
              
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!imageLoading[item.handle]) {
                        handlePrevImage(item.handle);
                      }
                    }}
                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity z-10 ${
                      imageLoading[item.handle] ? 'cursor-not-allowed' : ''
                    }`}
                    disabled={imageLoading[item.handle]}
                  >
                    <span className="material-icons">chevron_left</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!imageLoading[item.handle]) {
                        handleNextImage(item.handle);
                      }
                    }}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity z-10 ${
                      imageLoading[item.handle] ? 'cursor-not-allowed' : ''
                    }`}
                    disabled={imageLoading[item.handle]}
                  >
                    <span className="material-icons">chevron_right</span>
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                    {item.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          idx === currentImageIndexes[item.handle]
                            ? 'bg-white'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{item.title}</h2>
              <p className="font-medium mb-2">Handle: {item.handle}</p>
              <div className="space-y-2">
                {item.variants.map((variant, idx) => (
                  <div key={`${item.handle}-${variant.sku || idx}`} className="text-sm">
                    <p className="font-medium">Size: {variant.option1}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 