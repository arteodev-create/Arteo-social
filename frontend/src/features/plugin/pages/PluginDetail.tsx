import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Button, Icons, LoadingSpinner } from '@shared/ui';
import { pluginApi } from '@features/plugin/api';
import { queryKeys } from '@shared/lib';
import type { Plugin } from '@features/plugin/model';
import { useAuthStore } from '@entities/session/model';

const isPlugin = (value: unknown): value is Plugin => Boolean(value && typeof value === 'object' && 'uuid' in value);

const unwrapPlugin = (response: unknown): Plugin | null => {
  const payload = response as { data?: unknown; plugin?: unknown } | undefined;
  const responseData = payload?.data;
  const nestedPlugin = responseData && typeof responseData === 'object' && 'plugin' in responseData
    ? (responseData as { plugin?: unknown }).plugin
    : undefined;
  const data = nestedPlugin || responseData || payload?.plugin || response;
  return isPlugin(data) ? data : null;
};

const PluginDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const { data: response, isLoading, error } = useQuery({
    queryKey: queryKeys.plugin(id),
    queryFn: () => pluginApi.getPluginById(id!),
    enabled: !!id,
  });

  const plugin = unwrapPlugin(response);
  const author = plugin?.author;
  const authorName = author?.username || 'arteo';
  const isVerified = Boolean(author?.isVerified || author?.is_verified);
  const tags = plugin?.tags || [];
  const isOwner = Boolean(plugin && currentUser?.uuid && (plugin.author?.uuid === currentUser.uuid || plugin.authorId === currentUser.uuid || plugin.author_id === currentUser.uuid));

  const refreshLibrary = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.plugins }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pluginsMy }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pluginsPublic }),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading plugin..." />
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <Icons.Books size={28} weight="light" className="text-[var(--text-muted)]" />
        </div>
        <h1 className="text-[26px] font-black text-[var(--text-primary)]">Plugin not found</h1>
        <p className="mt-3 max-w-md text-[14px] font-medium leading-relaxed text-[var(--text-muted)]">
          This marketplace item may have been removed, made private, or is temporarily unavailable.
        </p>
        <Button className="mt-7" onClick={() => navigate('/plugins')}>
          Back to marketplace
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{plugin.name} | Arteo Library</title>
        {plugin.description && <meta name="description" content={plugin.description} />}
      </Helmet>

      <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <section className="overflow-hidden rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)] px-6 py-5">
            <Button variant="ghost" size="sm" onClick={() => navigate('/plugins')} className="rounded-[8px]">
              <Icons.Arrow size={14} weight="bold" />
              Arteo Library
            </Button>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_260px] md:p-9">
            <div>
              <div className="mb-7 flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-sm">
                  <Icons.Bird size={32} className="text-[var(--text-primary)]" />
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-1 text-[11px] font-black uppercase text-[var(--text-muted)]">
                      {plugin.category || 'General'}
                    </span>
                    <span className="rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-1 text-[11px] font-black uppercase text-[var(--text-muted)]">
                      v{plugin.version || '1.0.0'}
                    </span>
                  </div>
                  <h1 className="text-[34px] font-black leading-none tracking-tight text-[var(--text-primary)] md:text-[48px]">
                    {plugin.name}
                  </h1>
                  <div className="mt-3 flex items-center gap-2 text-[13px] font-bold text-[var(--text-muted)]">
                    <span>By @{authorName}</span>
                    {isVerified && <Icons.SealCheck size={16} weight="fill" className="text-[var(--text-primary)]" />}
                  </div>
                </div>
              </div>

              <p className="max-w-3xl text-[16px] font-medium leading-7 text-[var(--text-muted)]">
                {plugin.description || 'A reusable Arteo intelligence block for extending marketplace workflows.'}
              </p>

              {tags.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-[8px] bg-[var(--bg-primary)] px-3 py-1.5 text-[12px] font-bold text-[var(--text-muted)]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-3 rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
              <Button
                onClick={async () => {
                  try {
                    await pluginApi.installPlugin(plugin.uuid);
                    await refreshLibrary();
                    toast.success('Installed to your Library');
                  } catch {
                    toast.error('Unable to install plugin');
                  }
                }}
                className="w-full"
              >
                <Icons.Plus size={16} weight="bold" />
                Install
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await pluginApi.downloadPlugin(plugin.uuid);
                    toast.success('Download started');
                  } catch {
                    toast.error('Unable to download plugin');
                  }
                }}
                className="w-full"
              >
                <Icons.Arrow size={16} weight="bold" />
                Download
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/plugins/studio/${plugin.uuid}`)} className="w-full">
                <Icons.Edit size={16} weight="bold" />
                Settings
              </Button>
              {isOwner && (
                <Button
                  variant="danger"
                  onClick={async () => {
                    try {
                      await pluginApi.deletePlugin(plugin.uuid);
                      await refreshLibrary();
                      toast.success('Plugin deleted');
                      navigate('/plugins');
                    } catch {
                      toast.error('Unable to delete plugin');
                    }
                  }}
                  className="w-full"
                >
                  <Icons.Trash size={16} weight="bold" />
                  Delete
                </Button>
              )}
              <div className="mt-2 rounded-[8px] bg-[var(--bg-secondary)] p-4 text-[12px] font-bold leading-5 text-[var(--text-muted)]">
                Other Library features are marked as coming soon until their full backend flow is launch-ready.
              </div>
            </aside>
          </div>
        </section>

        {plugin.code && (
          <section className="rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <div className="mb-4 flex items-center gap-2 text-[13px] font-black text-[var(--text-primary)]">
              <Icons.FileText size={16} weight="bold" />
              Plugin source preview
            </div>
            <pre className="max-h-[360px] overflow-auto rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-5 text-[12px] leading-6 text-[var(--text-muted)]">
              <code>{plugin.code}</code>
            </pre>
          </section>
        )}
      </article>
    </>
  );
};

export default PluginDetail;
