export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-8 w-64 bg-white/10 rounded-full mx-auto mb-8 animate-pulse" />
          <div className="h-12 w-96 bg-white/10 rounded-xl mx-auto mb-6 animate-pulse" />
          <div className="h-6 w-80 bg-white/10 rounded-lg mx-auto mb-10 animate-pulse" />
          <div className="flex justify-center gap-4">
            <div className="h-14 w-40 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-14 w-40 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-24 bg-gray-100 rounded mx-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Snippets Skeleton */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-100 rounded mb-4 animate-pulse" />
                <div className="h-32 bg-gray-100 rounded-xl mb-4 animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
