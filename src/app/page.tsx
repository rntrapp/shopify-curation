export default function Page() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="text-center max-w-xl p-8">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Assembly Label Re-worn Drop Tracker
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Use the navigation menu on the left to view and manage product drops.
        </p>
        <a 
          href="/products" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          View All Products
        </a>
        <div className="text-8xl mt-8 animate-pulse">
          ←
        </div>
      </div>
    </div>
  );
}
