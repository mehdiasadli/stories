export const botRegexes: RegExp[] = [
  // --- Meta (Facebook, Instagram, WhatsApp) ---
  /facebookexternalhit/i,
  /Facebot/i,
  /Instagram/i,
  /WhatsApp/i,

  // --- Messaging / Social ---
  /TelegramBot/i,
  /Twitterbot/i,
  /Discordbot/i,
  /redditbot/i,
  /Slackbot/i,

  // --- Search Engines ---
  /Googlebot/i,
  /bingbot/i,
  /DuckDuckBot/i,
  /PetalBot/i, // Huawei search engine
  /DotBot/i, // Moz’s crawler

  // --- Media / Sharing ---
  /YouTubeBot/i,
  /Pinterestbot/i,

  // --- SEO / Scrapers ---
  /AhrefsBot/i,
  /SemrushBot/i,
  /MJ12bot/i,

  // --- Generic catch-all safety nets ---
  /\b[a-z0-9]*bot\b/i, // matches anything ending in "bot"
  /\bcrawl(?:er|ing)?\b/i, // crawler / crawling
  /\bspider\b/i, // spider
];

export function checkIfBot(ua: string = '') {
  return botRegexes.some((r) => r.test(ua));
}
