declare module "react-router-sitemap" {
  export const sitemapBuilder: (publicUrl: string, paths: string[]) => { toString: () => string };
}
