import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { QueryProvider } from "./providers/QueryProvider";

function App() {
  const basePath = (globalThis as any).__BASE_PATH__ || "/";

  return (
    <QueryProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter basename={basePath}>
          <AppRoutes />
        </BrowserRouter>
      </I18nextProvider>
    </QueryProvider>
  );
}

export default App;
