import ProfileGuard from '@/src/components/ui/ProfileGuard';

export default function CustomerProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileGuard>{children}</ProfileGuard>;
}

