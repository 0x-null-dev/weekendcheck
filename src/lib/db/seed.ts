import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TAGS = ["vibe coded", "AI", "side project", "micro SaaS", "dev tool", "productivity", "finance", "social"];

function pickTags(index: number): string[] {
  const count = (index % 3) + 1;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(TAGS[(index + i) % TAGS.length]);
  }
  return result;
}

const RAW_PROJECTS = [
  { name: "Gapspot", x_handle: "danmerrick117", url: "https://gapspot.ai", logo_url: "https://www.google.com/s2/favicons?domain=gapspot.ai&sz=64" },
  { name: "Betsuite", x_handle: "DylanNoal", url: "http://betsuite.ai", logo_url: "https://www.google.com/s2/favicons?domain=betsuite.ai&sz=64" },
  { name: "Clawdhost", x_handle: "Chikker96", url: "https://clawdhost.net", logo_url: "https://www.google.com/s2/favicons?domain=clawdhost.net&sz=64" },
  { name: "Reviewai", x_handle: "aminnnn_09", url: "https://reviewai.pro", logo_url: "https://www.google.com/s2/favicons?domain=reviewai.pro&sz=64" },
  { name: "Onleads", x_handle: "JesusReveron", url: "http://OnLeads.chat", logo_url: "https://www.google.com/s2/favicons?domain=OnLeads.chat&sz=64" },
  { name: "Publishflow", x_handle: "abdulganiyshehu", url: "http://Publishflow.io", logo_url: "https://www.google.com/s2/favicons?domain=Publishflow.io&sz=64" },
  { name: "Nxtsignal", x_handle: "buildrtweets", url: "https://nxtsignal.com", logo_url: "https://www.google.com/s2/favicons?domain=nxtsignal.com&sz=64" },
  { name: "GLB Studio", x_handle: "sauls_io", url: "https://glb.studio", logo_url: "https://www.google.com/s2/favicons?domain=glb.studio&sz=64" },
  { name: "PennyWise", x_handle: "spike_dev11739", url: "http://Pennywisebudgeting.com", logo_url: "https://www.google.com/s2/favicons?domain=Pennywisebudgeting.com&sz=64" },
  { name: "TapRefer", x_handle: "JiteshGhanchi", url: "https://taprefer.com", logo_url: "https://www.google.com/s2/favicons?domain=taprefer.com&sz=64" },
  { name: "LaunchLog", x_handle: "LaunchLog2026", url: "http://launchlog.fun", logo_url: "https://www.google.com/s2/favicons?domain=launchlog.fun&sz=64" },
  { name: "Ecomrads", x_handle: "bilaliwah", url: "http://ecomrads.com", logo_url: "https://www.google.com/s2/favicons?domain=ecomrads.com&sz=64" },
  { name: "WealthScore", x_handle: "memezacom", url: "https://whatismywealthscore.com", logo_url: "https://www.google.com/s2/favicons?domain=whatismywealthscore.com&sz=64" },
  { name: "IntervueMe", x_handle: "ravinde82068624", url: "https://intervueme.com", logo_url: "https://www.google.com/s2/favicons?domain=intervueme.com&sz=64" },
  { name: "Techne", x_handle: "_otakescake", url: "https://techne.blog", logo_url: "https://www.google.com/s2/favicons?domain=techne.blog&sz=64" },
  { name: "RetroShift", x_handle: "itsmeagain_fb", url: "http://retroshift.dev", logo_url: "https://www.google.com/s2/favicons?domain=retroshift.dev&sz=64" },
  { name: "Deen Tracker", x_handle: "DeenTrackerApp", url: "https://apps.apple.com/gb/app/deen-tracker-prayer-times/id6756148134", logo_url: "https://www.google.com/s2/favicons?domain=apps.apple.com&sz=64" },
  { name: "Dev-OffCode", x_handle: "OffCryptAndroid", url: "https://dev-offcode.com", logo_url: "https://www.google.com/s2/favicons?domain=dev-offcode.com&sz=64" },
  { name: "NuxtStart", x_handle: "nuxtstart", url: "https://nuxtstart.com", logo_url: "https://www.google.com/s2/favicons?domain=nuxtstart.com&sz=64" },
  { name: "Beyoneer IDE", x_handle: "Beyoneer", url: "http://Beyoneer.xyz", logo_url: "https://www.google.com/s2/favicons?domain=Beyoneer.xyz&sz=64" },
  { name: "Clip", x_handle: "RealPentester", url: "https://clip.demtos.com", logo_url: "https://www.google.com/s2/favicons?domain=clip.demtos.com&sz=64" },
  { name: "Siteshamer", x_handle: "Umitech_AU", url: "http://Siteshamer.com", logo_url: "https://www.google.com/s2/favicons?domain=Siteshamer.com&sz=64" },
  { name: "Codeown", x_handle: "neocode_io", url: "https://codeown.space", logo_url: "https://www.google.com/s2/favicons?domain=codeown.space&sz=64" },
  { name: "Sync UI", x_handle: "syncuidesign", url: "https://syncui.design", logo_url: "https://www.google.com/s2/favicons?domain=syncui.design&sz=64" },
  { name: "Portuguess", x_handle: "egorkaway", url: "https://portuguess.com", logo_url: "https://www.google.com/s2/favicons?domain=portuguess.com&sz=64" },
  { name: "Cronping", x_handle: "ronaldkuiper_nl", url: "http://Cronping.newlin.nl", logo_url: "https://www.google.com/s2/favicons?domain=Cronping.newlin.nl&sz=64" },
  { name: "Reddleads", x_handle: "SohamXYZ", url: "http://reddleads.com", logo_url: "https://www.google.com/s2/favicons?domain=reddleads.com&sz=64" },
  { name: "Confidence Daily", x_handle: "RayRothwell", url: "https://confidencedaily.app", logo_url: "https://www.google.com/s2/favicons?domain=confidencedaily.app&sz=64" },
  { name: "Ntropi", x_handle: "amitrajeet7635", url: "http://ntropi.tech", logo_url: "https://www.google.com/s2/favicons?domain=ntropi.tech&sz=64" },
  { name: "Mokaru", x_handle: "vndckbuilds", url: "http://Mokaru.ai", logo_url: "https://www.google.com/s2/favicons?domain=Mokaru.ai&sz=64" },
  { name: "Sigmagit", x_handle: "GasTheFrench", url: "http://sigmagit.com", logo_url: "https://www.google.com/s2/favicons?domain=sigmagit.com&sz=64" },
  { name: "Microlaunch", x_handle: "SaidAitmbarek", url: "http://microlaunch.net/premium", logo_url: "https://www.google.com/s2/favicons?domain=microlaunch.net&sz=64" },
  { name: "Fubar Daily", x_handle: "FubarDaily", url: "https://fubardaily.com", logo_url: "https://www.google.com/s2/favicons?domain=fubardaily.com&sz=64" },
  { name: "Clawdence", x_handle: "spectragai", url: "https://clawdence.com", logo_url: "https://www.google.com/s2/favicons?domain=clawdence.com&sz=64" },
  { name: "Playmix", x_handle: "eve_silb", url: "http://playmix.ai", logo_url: "https://www.google.com/s2/favicons?domain=playmix.ai&sz=64" },
  { name: "MyAIConsent", x_handle: "KrupeshDesai86", url: "https://myaiconsent.app", logo_url: "https://www.google.com/s2/favicons?domain=myaiconsent.app&sz=64" },
  { name: "Demodokos", x_handle: "_Demodokos_", url: "https://demodokos.com", logo_url: "https://www.google.com/s2/favicons?domain=demodokos.com&sz=64" },
  { name: "ReplyTone", x_handle: "urk_09", url: "https://reply-tone-dashboard.vercel.app", logo_url: "https://www.google.com/s2/favicons?domain=reply-tone-dashboard.vercel.app&sz=64" },
  { name: "CaelumOS", x_handle: "Kryptopacy", url: "http://CaelumOS.trade", logo_url: "https://www.google.com/s2/favicons?domain=CaelumOS.trade&sz=64" },
  { name: "BuildFromPain", x_handle: "GandotraAB03", url: "http://buildfrompain.xyz", logo_url: "https://www.google.com/s2/favicons?domain=buildfrompain.xyz&sz=64" },
  { name: "ASOZen", x_handle: "MohammedRam", url: "http://ASOZen.com", logo_url: "https://www.google.com/s2/favicons?domain=ASOZen.com&sz=64" },
  { name: "AvariAI", x_handle: "Miracleharbor", url: "https://avariai.xyz", logo_url: "https://www.google.com/s2/favicons?domain=avariai.xyz&sz=64" },
  { name: "PostVera", x_handle: "Subhajit_das21", url: "http://post-vera.vercel.app", logo_url: "https://www.google.com/s2/favicons?domain=post-vera.vercel.app&sz=64" },
  { name: "MomentumOS", x_handle: "triorockets", url: "https://momentumos.triorockets.com", logo_url: "https://www.google.com/s2/favicons?domain=momentumos.triorockets.com&sz=64" },
  { name: "Solflow", x_handle: "partnero367", url: "https://solflow-build.vercel.app", logo_url: "https://www.google.com/s2/favicons?domain=solflow-build.vercel.app&sz=64" },
  { name: "3web", x_handle: "truckistani222", url: "http://3web.ai", logo_url: "https://www.google.com/s2/favicons?domain=3web.ai&sz=64" },
  { name: "Clawbolt", x_handle: "RoboCat385885", url: "http://Clawbolt.online", logo_url: "https://www.google.com/s2/favicons?domain=Clawbolt.online&sz=64" },
  { name: "Mailos", x_handle: "mitesh_r_v", url: "https://mailos.in", logo_url: "https://www.google.com/s2/favicons?domain=mailos.in&sz=64" },
  { name: "Sento24", x_handle: "SentoAI24", url: "http://sento24.com", logo_url: "https://www.google.com/s2/favicons?domain=sento24.com&sz=64" },
  { name: "AppToolsPro", x_handle: "shabishetty07", url: "http://apptoolspro.com", logo_url: "https://www.google.com/s2/favicons?domain=apptoolspro.com&sz=64" },
  { name: "StartupMaya", x_handle: "tusharthethe", url: "http://startupmaya.com", logo_url: "https://www.google.com/s2/favicons?domain=startupmaya.com&sz=64" },
  { name: "Sendpigeon", x_handle: "shredandship", url: "http://Sendpigeon.dev", logo_url: "https://www.google.com/s2/favicons?domain=Sendpigeon.dev&sz=64" },
  { name: "Useordr", x_handle: "iam_eugenio", url: "http://useordr.app", logo_url: "https://www.google.com/s2/favicons?domain=useordr.app&sz=64" },
  { name: "WalkoSystems", x_handle: "walkojas", url: "http://Walkosystems.com", logo_url: "https://www.google.com/s2/favicons?domain=Walkosystems.com&sz=64" },
  { name: "JobsByCulture", x_handle: "itspradz", url: "https://jobsbyculture.com", logo_url: "https://www.google.com/s2/favicons?domain=jobsbyculture.com&sz=64" },
  { name: "OpenClaw", x_handle: "openclaw_direct", url: "https://openclaw.direct", logo_url: "https://www.google.com/s2/favicons?domain=openclaw.direct&sz=64" },
  { name: "MagicMint", x_handle: "0nchain365", url: "http://magicmint.app", logo_url: "https://www.google.com/s2/favicons?domain=magicmint.app&sz=64" },
  { name: "Glazyr", x_handle: "MCPMessenger", url: "http://glazyr.com", logo_url: "https://www.google.com/s2/favicons?domain=glazyr.com&sz=64" },
  { name: "Protawk", x_handle: "MemonZain1", url: "http://protawk.com", logo_url: "https://www.google.com/s2/favicons?domain=protawk.com&sz=64" },
  { name: "ApplyWiseAI", x_handle: "ApplyWiseAi", url: "http://applywiseai.com", logo_url: "https://www.google.com/s2/favicons?domain=applywiseai.com&sz=64" },
  { name: "Elurance", x_handle: "hemantrajput114", url: "http://Elurance.com", logo_url: "https://www.google.com/s2/favicons?domain=Elurance.com&sz=64" },
  { name: "VibingRadar", x_handle: "vibingradar", url: "https://vibingradar.com", logo_url: "https://www.google.com/s2/favicons?domain=vibingradar.com&sz=64" },
  { name: "YouScript", x_handle: "bhargavk_", url: "http://YouScript.Pro", logo_url: "https://www.google.com/s2/favicons?domain=YouScript.Pro&sz=64" },
];

const DESCRIPTIONS: Record<number, string> = {
  0: "AI-powered gap analysis for market opportunities. Find underserved niches before anyone else.",
  1: "AI-powered sports betting analytics and predictions. Track odds, analyze trends, and make smarter bets with real-time data across all major sportsbooks.",
  2: "One-click hosting for Claude artifacts. Deploy in seconds. No config, no Docker, no headaches. Just push and it's live.",
  3: "AI-powered review aggregation across all platforms. Pull in Google, Trustpilot, G2, and more into one dashboard with sentiment analysis.",
  4: "Conversational lead generation chatbot for businesses. Replace your boring contact form with a natural chat experience that actually converts.",
};

const REVIEW_TEXTS = [
  {
    projectIndex: 1,
    reviewNumber: 1,
    loomUrl: "https://www.loom.com/embed/placeholder-betsuite-review",
    text: `## First Impression\nClean landing page, gets to the point fast. The AI angle is clear immediately. You land on it and within 5 seconds you know what this thing does. No fluff, no "revolutionizing the future of..." nonsense. Just a clear value prop with a big sign-up button. The design is minimal but not lazy. They clearly thought about the above-the-fold experience.\n\n## What Works\nThe onboarding flow is smooth. I signed up and had a dashboard in under 30 seconds. That's rare. Most products I test make me fill out a 10-field form before I can even see what the product looks like. Here, it was email, password, done. The dashboard loaded instantly and the first thing I saw was a guided tour that actually made sense. The AI suggestions started appearing within minutes of connecting my data source. They weren't generic either. Genuinely useful recommendations.\n\n## What Doesn't\nThe pricing page is confusing. Three tiers but the feature diff is unclear. I spent a solid 2 minutes trying to figure out why I'd pay for Pro over Free and I still don't get it. The comparison table uses vague language like "advanced analytics" vs "basic analytics" without explaining what that actually means. Also, the mobile experience is rough. The dashboard is clearly desktop-first and on my phone half the charts were cut off. If your users are checking stats on the go, this needs work.\n\n## What I'd Build Next\n- Dark mode (obviously, it's 2026)\n- API access for power users who want to pipe this into their own tools\n- Better mobile experience. Not just responsive, actually mobile-first for the key workflows\n- A changelog or "what's new" section so returning users know what shipped\n- Export to CSV for the analytics data`,
    createdAt: new Date(2026, 2, 5),
  },
  {
    projectIndex: 1,
    reviewNumber: 2,
    text: `## Follow-Up\nCame back two weeks later to see what changed. They shipped dark mode and the mobile experience is noticeably better. Charts resize properly now and the key stats are readable on a phone.\n\n## What Improved\nPricing page got a complete rework. The tiers make sense now — Free is clearly for hobbyists, Pro unlocks the real-time data feeds, and Team adds collaboration. Much clearer.\n\n## Still Missing\n- API access still not available\n- No changelog yet so I had to poke around to find what changed\n- CSV export works but the formatting is rough`,
    createdAt: new Date(2026, 2, 19),
  },
  {
    projectIndex: 2,
    reviewNumber: 1,
    text: `## First Impression\nHosting for Claude artifacts — interesting niche. The name is fun.\n\n## What Works\nDeploy flow is dead simple. Push and it's live. Exactly what vibe coders need.\n\n## What Doesn't\nNo custom domain support yet. That's a dealbreaker for anyone serious about shipping.\n\n## Features I Want\n- Custom domains\n- Basic analytics\n- GitHub integration`,
    createdAt: new Date(2026, 2, 6),
  },
  {
    projectIndex: 3,
    reviewNumber: 1,
    text: `## First Impression\nAI-powered review aggregation. Smart idea, crowded space.\n\n## What Works\nThe sentiment analysis is surprisingly accurate. It caught nuance that most tools miss.\n\n## What Doesn't\nUI feels rushed. Lots of placeholder text still visible. Ship it cleaner.\n\n## Features I Want\n- Competitor comparison view\n- Export to CSV\n- Slack integration for alerts`,
    createdAt: new Date(2026, 2, 6),
  },
  {
    projectIndex: 4,
    reviewNumber: 1,
    text: `## First Impression\nLead gen via chat — the conversational approach is smart.\n\n## What Works\nThe chatbot actually feels natural. Not the usual robotic Q&A. Good prompt engineering.\n\n## What Doesn't\nPricing is hidden. I had to dig through 3 pages to find it. Just put it on the landing page.\n\n## Features I Want\n- CRM integrations\n- A/B testing for chat flows\n- Multi-language support`,
    createdAt: new Date(2026, 2, 7),
  },
];

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(schema.reviews);
  await db.delete(schema.projects);

  // Seed projects
  const projectValues = RAW_PROJECTS.map((p, i) => ({
    id: `proj-${i + 1}`,
    slug: slugify(p.name),
    name: p.name,
    logoUrl: p.logo_url,
    url: p.url,
    description: DESCRIPTIONS[i] || "",
    xHandle: p.x_handle,
    tags: pickTags(i),
    status: (i === 0 ? "in_review" : i < 5 ? "checked" : "in_queue") as "in_review" | "checked" | "in_queue",
    upvotes: Math.floor(Math.random() * 80) + 1,
    featured: i >= 5 && i < 9,
    toolsIUse: false,
    bestLastWeek: i >= 1 && i < 5,
    createdAt: new Date(2026, 2, 1 + Math.floor(i / 4)),
    reviewedAt: i > 0 && i < 5 ? new Date(2026, 2, 5) : undefined,
  }));

  await db.insert(schema.projects).values(projectValues);
  console.log(`Inserted ${projectValues.length} projects`);

  // Seed reviews
  const reviewValues = REVIEW_TEXTS.map((r, i) => ({
    id: `rev-${i + 1}`,
    projectId: `proj-${r.projectIndex + 1}`,
    reviewNumber: r.reviewNumber,
    text: r.text,
    loomUrl: r.loomUrl || null,
    screenshots: [] as string[],
    published: true,
    createdAt: r.createdAt,
    updatedAt: r.createdAt,
  }));

  await db.insert(schema.reviews).values(reviewValues);
  console.log(`Inserted ${reviewValues.length} reviews`);

  console.log("Done!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
