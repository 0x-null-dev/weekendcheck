// Public origin used for canonical URLs, sitemaps, and share previews.
export const siteUrl = "https://check.0xalex.com";
export const siteName = "0xAlex Check";
export const siteDescription = "Alex explores indie apps and AI projects, then shares practical feedback when there is something useful to say.";
export const xHandle = "0xAlex_dev";
// Total I plan to spend on paid access, in euro cents.
export const budgetCents = 100_000;

export const formatEuros = (cents: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
