// MCR file header: Frontend\vite-env.d.ts
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


/// <reference types="vite/client" />

declare const __BASE_PATH__: string;

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
