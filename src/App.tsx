import { useEffect } from "react";
import { DesktopShell } from "@/components/portfolio/DesktopShell";
import { PORTFOLIO_CONFIG } from "@/config/portfolio";

export default function App() {
  /* Runtime metadata follows the same editable portfolio config. */
  useEffect(() => {
    document.title = PORTFOLIO_CONFIG.seo.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = PORTFOLIO_CONFIG.seo.description;
  }, []);

  return <DesktopShell />;
}
