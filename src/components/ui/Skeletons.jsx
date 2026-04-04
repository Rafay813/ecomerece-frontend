// Loading skeleton components for better UX
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-40 w-full" />
      <div className="p-3 space-y-2">
        <div className="bg-gray-200 h-3 rounded w-full" />
        <div className="bg-gray-200 h-3 rounded w-3/4" />
        <div className="flex justify-between items-center mt-3">
          <div className="bg-gray-200 h-4 rounded w-1/3" />
          <div className="bg-gray-200 h-7 w-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 animate-pulse">
      <div className="bg-gray-200 w-32 h-32 rounded-lg shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="bg-gray-200 h-4 rounded w-3/4" />
        <div className="bg-gray-200 h-4 rounded w-1/3" />
        <div className="bg-gray-200 h-3 rounded w-full" />
        <div className="bg-gray-200 h-3 rounded w-5/6" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-sm">
        <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-red-700 font-medium mb-1">Something went wrong</p>
        <p className="text-xs text-red-500 mb-4">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-1.5 rounded-lg transition-colors">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}