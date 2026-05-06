export const pluginQueryKeys = {
  plugins: ['plugins'] as const,
  pluginsPublic: ['plugins', 'public'] as const,
  pluginsMy: ['plugins', 'my'] as const,
  plugin: (id?: string) => ['plugins', 'detail', id] as const,
};
