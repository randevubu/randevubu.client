import Skeleton, { SkeletonFormField } from './Skeleton';

export default function OnboardingPageSkeleton() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto pb-8">
      {/* Hero Section Skeleton */}
      <section className="relative bg-white pt-20 pb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <Skeleton className="inline-block w-24 h-6 mb-4" variant="rounded" />

          <div className="space-y-4 mb-6">
            <Skeleton className="h-12 lg:h-14 w-3/4 mx-auto" variant="rounded" />
            <Skeleton className="h-12 lg:h-14 w-2/3 mx-auto" variant="rounded" />
          </div>

          <Skeleton className="h-6 w-1/2 mx-auto mb-8" variant="rounded" />
        </div>
      </section>

      {/* Form Section Skeleton */}
      <section className="pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 mx-2 sm:mx-0">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="space-y-6 sm:space-y-8">
                {/* Business Type Field */}
                <SkeletonFormField />

                {/* Business Name Field */}
                <div>
                  <SkeletonFormField />
                  {/* URL Preview */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton variant="rounded" className="h-24 w-full" />
                </div>

                {/* City Field */}
                <SkeletonFormField />

                {/* Address Fields */}
                <div className="space-y-6">
                  <SkeletonFormField />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SkeletonFormField />
                    <SkeletonFormField />
                  </div>

                  <SkeletonFormField />
                </div>

                {/* Phone Field */}
                <SkeletonFormField />

                {/* Website Field */}
                <div>
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton variant="rounded" className="h-12 w-full" />
                  <Skeleton className="h-3 w-3/4 mt-2" />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Skeleton variant="rounded" className="h-14 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Status */}
      <div className="flex items-center justify-center mt-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    </div>
  );
}
