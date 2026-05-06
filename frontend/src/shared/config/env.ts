export const env = {
  appName: process.env.REACT_APP_NAME || 'Arteo',
  appEnv: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.REACT_APP_API_URL || '',
  socketUrl: process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_WS_URL || '',
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
} as const;

export type AppEnv = (typeof env)['appEnv'];
