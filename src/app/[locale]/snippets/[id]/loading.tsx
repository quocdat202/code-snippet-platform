export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-3 mb-4">
            <div className="h-7 w-20 bg-white/10 rounded-full animate-pulse" />
            <div className="h-7 w-16 bg-white/10 rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-2/3 bg-white/10 rounded-xl mb-4 animate-pulse" />
          <div className="h-5 w-1/2 bg-white/10 rounded-lg mb-6 animate-pulse" />
          <div className="flex items-center gap-4 px-4 py-3 bg-white/10 rounded-2xl w-fit">
            <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-white/20 rounded mb-2 animate-pulse" />
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex gap-3 mb-8">
          <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
