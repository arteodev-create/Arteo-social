export const algorithmQueryKeys = {
  algorithms: ['algorithms'] as const,
  algorithmsPublic: ['algorithms', 'public'] as const,
  algorithmsMy: ['algorithms', 'my'] as const,
  algorithm: (id: string | undefined) => ['algorithm', id] as const,
};
