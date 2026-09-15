import { PORTFOLIO_CONFIG } from "@/config/portfolio";

/** Compatibility exports keep display components clean. Their source of
 * truth is always src/config/portfolio.ts. */
export type Social = (typeof PORTFOLIO_CONFIG.socials)[number];
/** Leave a social href empty in the config to hide it everywhere. */
export const SOCIALS: ReadonlyArray<Social> = PORTFOLIO_CONFIG.socials.filter(
  (social) => social.href.trim().length > 0,
);
export const EMAIL = PORTFOLIO_CONFIG.contact.email;
export const IDENTITY = PORTFOLIO_CONFIG.identity;
export const SITE_LINKS = PORTFOLIO_CONFIG.links;
