'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');

  useEffect(() => {
    // Redirect to the new URL-based booking flow
        if (serviceId) {
      router.push(`/businesses/${slug}/book/service?serviceId=${serviceId}`);
    } else {
      router.push(`/businesses/${slug}/book/service`);
    }
  }, [slug, serviceId, router]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center">
        <div className="text-center">
        <div className="w-8 h-8 border-3 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-[var(--theme-foregroundSecondary)]">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
