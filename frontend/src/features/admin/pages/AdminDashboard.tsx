import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, Database, FileText, Pulse } from '@phosphor-icons/react';
import { AdminService } from '@services/admin.service';
import { Button, LoadingSpinner } from '@shared/ui';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AdminService.getStats()
      .then((response) => {
        if (mounted && response.success) setStats(response.data);
      })
      .catch(() => {
        if (mounted) setStats(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { label: 'Users', value: stats?.totalUsers || stats?.users || 0, icon: Users },
    { label: 'Posts', value: stats?.totalPosts || stats?.posts || 0, icon: FileText },
    { label: 'Database', value: stats?.tables || '-', icon: Database },
    { label: 'Status', value: 'Online', icon: Pulse },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/15 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-white/20">
            <ShieldCheck size={22} weight="bold" />
          </div>
          <div>
            <h1 className="text-[18px] font-black leading-none">Admin</h1>
            <p className="mt-1 text-[11px] font-bold uppercase text-zinc-500">Arteo control plane</p>
          </div>
        </div>
        <Button variant="secondary" className="h-10 border-white/20 bg-black text-white hover:bg-white hover:text-black">
          Refresh
        </Button>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingSpinner size="lg" label="Loading admin data..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <section key={card.label} className="border border-white/15 bg-black p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black uppercase text-zinc-500">{card.label}</span>
                    <Icon size={20} weight="bold" className="text-zinc-500" />
                  </div>
                  <div className="mt-8 text-[34px] font-black leading-none">{card.value}</div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
