import Skeleton from './Skeleton';

interface SubscriptionPageSkeletonProps {
  loadingMessage?: string;
}

export default function SubscriptionPageSkeleton({
  loadingMessage = 'Yükleniyor...'
}: SubscriptionPageSkeletonProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative bg-white pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <Skeleton className="inline-block w-20 h-6 mb-3 sm:mb-4" variant="rounded" />

          <div className="space-y-3 mb-4 sm:mb-6">
            <Skeleton className="h-8 sm:h-12 lg:h-14 w-3/4 mx-auto" variant="rounded" />
            <Skeleton className="h-8 sm:h-12 lg:h-14 w-2/3 mx-auto" variant="rounded" />
          </div>

          <Skeleton className="h-4 sm:h-6 w-1/2 mx-auto mb-8 sm:mb-12" variant="rounded" />

          {/* Step Indicator Skeleton */}
          <div className="flex items-center justify-center mb-8 sm:mb-12 px-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton variant="circle" className="w-8 h-8 sm:w-10 sm:h-10" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-8 sm:hidden" />
              <Skeleton className="w-8 sm:w-16 h-0.5" />
              <Skeleton variant="circle" className="w-8 h-8 sm:w-10 sm:h-10" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="w-8 sm:w-16 h-0.5" />
              <Skeleton variant="circle" className="w-8 h-8 sm:w-10 sm:h-10" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-8 sm:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className="pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Subscription Plans Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                {/* Plan Badge */}
                <Skeleton className="h-6 w-20 mb-4" variant="rounded" />

                {/* Plan Name */}
                <Skeleton className="h-8 w-full mb-3" variant="rounded" />

                {/* Price */}
                <div className="flex items-baseline space-x-2 mb-6">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-6" />
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[...Array(5)].map((_, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Skeleton variant="circle" className="w-5 h-5" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Skeleton className="h-12 w-full" variant="rounded" />
              </div>
            ))}
          </div>

          {/* Loading Status */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 text-sm sm:text-base">{loadingMessage}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
