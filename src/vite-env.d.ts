/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEWS_API_KEY: string;
  readonly VITE_GOOGLE_FACT_CHECK_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
