'use client';

import { useEffect, useState } from 'react';

interface Variant {
  sku: string;
  option1: string;
  option2: string;
  inventory_quantity: number;
}

interface Item {
  handle: string;
  title: string;
  body_html: string;
  type: string;
  tags: string;
  image: string;
  variants: Variant[];
}

interface GroupedItem extends Omit<Item, 'variants'> {
  variants: Variant[];
  images: string[];
}

export default function Home() {
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/sheets');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        // const handles = [...new Set(data.items.map((item: any) => item.Handle))];
        

        // Group items by handle and process the data
        const grouped = Object.values(data.items.reduce((acc: Record<string, GroupedItem>, item: any) => {
          const handle = item.Handle;
          
          if (!acc[handle]) {
            // Initialize the group with the first item's data
            acc[handle] = {
              handle: handle,
              title: item.Title,
              body_html: item['Body (HTML)'],
              type: item.Type,
              tags: item.Tags,
              images: [], // We'll collect all unique images here
              variants: [] // We'll collect all variants here
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
              inventory_quantity: parseInt(item['Variant Inventory Qty']) || 0
            });
          }

          return acc;
        }, {}));

        console.log(grouped);

        setGroupedItems(grouped);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-xl text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">No items found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product List</h1>
      <div className="space-y-8">
        {groupedItems.map((item) => (
          <div
            key={item.handle}
            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-12 gap-6 p-6">
              {/* Images Column */}
              <div className="col-span-4 space-y-4">
                {item.images.slice(0, 2).map((imageUrl, index) => (
                  <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      key={`${item.handle}-image-${index}`}
                      src={imageUrl}
                      alt={`${item.title} - Image ${index + 1}`}
                      className="w-full rounded-lg object-cover border border-black my-1"
                    />
                  </a>
                ))}
              </div>

              {/* Details Column */}
              <div className="col-span-8 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  ID: {item.handle.split('-').pop()} <small className="text-gray-500">{item.handle}</small>
                </h2>
                <div className="gap-4 py-2">
                  <div className="font-bold text-gray-800 mb-2">{item.title}</div>
                  <div className="max-w-none bg-gray-100 text-black p-4 rounded-lg mb-2"
                     dangerouslySetInnerHTML={{ __html: item.body_html }}
                  />
                  <div>
                    <span className="font-semibold text-gray-600">Type:</span>
                    <span className="ml-2 text-gray-800">{item.type}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600 mr-2">Tags:</span>
                      {item.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm mr-2">
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Variants Section */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Variants</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Options</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inventory</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {item.variants.map((variant, index) => (
                          <tr key={`${item.handle}-variant-${variant.sku || index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 py-2 text-sm text-gray-800">{variant.sku}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">
                              {[variant.option1, variant.option2]
                                .filter(Boolean)
                                .join(' / ')}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-800">
                              {variant.inventory_quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
