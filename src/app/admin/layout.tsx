import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white flex">
      <AdminSidebar user={session.user} />
      <div className="flex-1 min-w-0">
        <div className="min-h-screen">{children}</div>
      </div>
    </div>
  );
}
