// MCR file header: Frontend\src\i18n\local\index.ts
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


const modules = import.meta.glob('./*/*.ts', { eager: true });

const messages: Record<string, { translation: Record<string, string> }> = {};

Object.keys(modules).forEach((path) => {
  const match = path.match(/\.\/([^/]+)\/([^/]+)\.ts$/);
  if (match) {
    const [, lang] = match;
    const module = modules[path] as { default?: Record<string, string> };
    
    if (!messages[lang]) {
      messages[lang] = { translation: {} };
    }
    
    // åˆå¹¶ç¿»è¯‘å†…å®¹
    if (module.default) {
      messages[lang].translation = {
        ...messages[lang].translation,
        ...module.default
      };
    }
  }
});

export default messages; 