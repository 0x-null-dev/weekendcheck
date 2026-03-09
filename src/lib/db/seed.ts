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

// All real projects — submitted via DMs
const PROJECTS = [
  { name: "Gapspot", x_handle: "danmerrick117", url: "https://gapspot.ai" },
  { name: "Betsuite", x_handle: "DylanNoal", url: "http://betsuite.ai" },
  { name: "Clawdhost", x_handle: "Chikker96", url: "https://clawdhost.net" },
  { name: "Reviewai", x_handle: "aminnnn_09", url: "https://reviewai.pro" },
  { name: "Onleads", x_handle: "JesusReveron", url: "http://OnLeads.chat" },
  { name: "Publishflow", x_handle: "abdulganiyshehu", url: "http://Publishflow.io" },
  { name: "Nxtsignal", x_handle: "buildrtweets", url: "https://nxtsignal.com" },
  { name: "GLB Studio", x_handle: "sauls_io", url: "https://glb.studio" },
  { name: "PennyWise", x_handle: "spike_dev11739", url: "http://Pennywisebudgeting.com" },
  { name: "TapRefer", x_handle: "JiteshGhanchi", url: "https://taprefer.com" },
  { name: "LaunchLog", x_handle: "LaunchLog2026", url: "http://launchlog.fun" },
  { name: "Ecomrads", x_handle: "bilaliwah", url: "http://ecomrads.com" },
  { name: "WealthScore", x_handle: "memezacom", url: "https://whatismywealthscore.com" },
  { name: "IntervueMe", x_handle: "ravinde82068624", url: "https://intervueme.com" },
  { name: "Techne", x_handle: "_otakescake", url: "https://techne.blog" },
  { name: "RetroShift", x_handle: "itsmeagain_fb", url: "http://retroshift.dev" },
  { name: "Deen Tracker", x_handle: "DeenTrackerApp", url: "https://apps.apple.com/gb/app/deen-tracker-prayer-times/id6756148134" },
  { name: "Dev-OffCode", x_handle: "OffCryptAndroid", url: "https://dev-offcode.com" },
  { name: "NuxtStart", x_handle: "nuxtstart", url: "https://nuxtstart.com" },
  { name: "Beyoneer IDE", x_handle: "Beyoneer", url: "http://Beyoneer.xyz" },
  { name: "Clip", x_handle: "RealPentester", url: "https://clip.demtos.com" },
  { name: "Siteshamer", x_handle: "Umitech_AU", url: "http://Siteshamer.com" },
  { name: "Codeown", x_handle: "neocode_io", url: "https://codeown.space" },
  { name: "Sync UI", x_handle: "syncuidesign", url: "https://syncui.design" },
  { name: "Portuguess", x_handle: "egorkaway", url: "https://portuguess.com" },
  { name: "Cronping", x_handle: "ronaldkuiper_nl", url: "http://Cronping.newlin.nl" },
  { name: "Reddleads", x_handle: "SohamXYZ", url: "http://reddleads.com" },
  { name: "Confidence Daily", x_handle: "RayRothwell", url: "https://confidencedaily.app" },
  { name: "Ntropi", x_handle: "amitrajeet7635", url: "http://ntropi.tech" },
  { name: "Mokaru", x_handle: "vndckbuilds", url: "http://Mokaru.ai" },
  { name: "Sigmagit", x_handle: "GasTheFrench", url: "http://sigmagit.com" },
  { name: "Microlaunch", x_handle: "SaidAitmbarek", url: "http://microlaunch.net/premium" },
  { name: "Fubar Daily", x_handle: "FubarDaily", url: "https://fubardaily.com" },
  { name: "Clawdence", x_handle: "spectragai", url: "https://clawdence.com" },
  { name: "Playmix", x_handle: "eve_silb", url: "http://playmix.ai" },
  { name: "MyAIConsent", x_handle: "KrupeshDesai86", url: "https://myaiconsent.app" },
  { name: "Demodokos", x_handle: "_Demodokos_", url: "https://demodokos.com" },
  { name: "ReplyTone", x_handle: "urk_09", url: "https://reply-tone-dashboard.vercel.app" },
  { name: "CaelumOS", x_handle: "Kryptopacy", url: "http://CaelumOS.trade" },
  { name: "BuildFromPain", x_handle: "GandotraAB03", url: "http://buildfrompain.xyz" },
  { name: "ASOZen", x_handle: "MohammedRam", url: "http://ASOZen.com" },
  { name: "AvariAI", x_handle: "Miracleharbor", url: "https://avariai.xyz" },
  { name: "PostVera", x_handle: "Subhajit_das21", url: "http://post-vera.vercel.app" },
  { name: "MomentumOS", x_handle: "triorockets", url: "https://momentumos.triorockets.com" },
  { name: "Solflow", x_handle: "partnero367", url: "https://solflow-build.vercel.app" },
  { name: "3web", x_handle: "truckistani222", url: "http://3web.ai" },
  { name: "Clawbolt", x_handle: "RoboCat385885", url: "http://Clawbolt.online" },
  { name: "Mailos", x_handle: "mitesh_r_v", url: "https://mailos.in" },
  { name: "Sento24", x_handle: "SentoAI24", url: "http://sento24.com" },
  { name: "AppToolsPro", x_handle: "shabishetty07", url: "http://apptoolspro.com" },
  { name: "StartupMaya", x_handle: "tusharthethe", url: "http://startupmaya.com" },
  { name: "Sendpigeon", x_handle: "shredandship", url: "http://Sendpigeon.dev" },
  { name: "Useordr", x_handle: "iam_eugenio", url: "http://useordr.app" },
  { name: "WalkoSystems", x_handle: "walkojas", url: "http://Walkosystems.com" },
  { name: "JobsByCulture", x_handle: "itspradz", url: "https://jobsbyculture.com" },
  { name: "OpenClaw", x_handle: "openclaw_direct", url: "https://openclaw.direct" },
  { name: "MagicMint", x_handle: "0nchain365", url: "http://magicmint.app" },
  { name: "Glazyr", x_handle: "MCPMessenger", url: "http://glazyr.com" },
  { name: "Protawk", x_handle: "MemonZain1", url: "http://protawk.com" },
  { name: "ApplyWiseAI", x_handle: "ApplyWiseAi", url: "http://applywiseai.com" },
  { name: "Elurance", x_handle: "hemantrajput114", url: "http://Elurance.com" },
  { name: "VibingRadar", x_handle: "vibingradar", url: "https://vibingradar.com" },
  { name: "YouScript", x_handle: "bhargavk_", url: "http://YouScript.Pro" },
  // --- batch 2: from X post comments ---
  { name: "Karmora", x_handle: "julezrz", url: "http://karmora.com" },
  { name: "TinyClaw", x_handle: "warengonzaga", url: "http://tinyclaw.ai" },
  { name: "Triggerfish", x_handle: "TriggerfishAI", url: "https://trigger.fish" },
  { name: "Pardesco Studio", x_handle: "pardesco_", url: "https://studio.pardesco.com" },
  { name: "Hot.tech", x_handle: "nirave", url: "http://hot.tech" },
  { name: "Orvia", x_handle: "x_surajkr", url: "https://orvia.live" },
  { name: "MirrorAI", x_handle: "TryItOnMirror", url: "https://mirrorai.cc" },
  { name: "SuperGeo", x_handle: "youngbuffalo111", url: "https://supergeo.io" },
  { name: "Founda", x_handle: "_beyond_logic", url: "https://tryfounda.com" },
  { name: "Aximor", x_handle: "AakashM_25", url: "http://Aximor.ai" },
  { name: "MarkFlow", x_handle: "OmarElhassani99", url: "http://markflowai.com" },
  { name: "SyncSellr", x_handle: "1mthisyear", url: "http://syncsellr.com" },
  { name: "Termino", x_handle: "walkojas", url: "http://termino.walkosystems.com" },
  { name: "InterviewTrackr", x_handle: "cya826787694811", url: "https://interviewtrackr.com" },
  { name: "StrideAI", x_handle: "hieuspringle", url: "http://getstrideai.com" },
  { name: "DocuForge", x_handle: "NalaLockspur", url: "http://Docuforge.io" },
  { name: "Finly", x_handle: "sajjadahammed", url: "https://finlyai.vercel.app" },
  { name: "TRIIT", x_handle: "yoiqino", url: "http://TRIIT.app" },
  { name: "ColorGen", x_handle: "ColorGenAi", url: "http://colorgen.ai" },
  { name: "ExpenseNest", x_handle: "its_b_pawan", url: "http://tryexpensenest.app" },
  { name: "Brevoir", x_handle: "nabuhad", url: "https://brevoir.com" },
  { name: "BurnArena", x_handle: "burnarenaapp", url: "https://burnarena.app" },
  { name: "RepoRoast", x_handle: "prateekhacks", url: "http://reporoast.prateekhacks.in" },
  { name: "Admit4You", x_handle: "admit4you", url: "http://admit4you.com" },
  { name: "SyntropyAI", x_handle: "hossamel77", url: "http://syntropyai.app" },
  { name: "ClawInst", x_handle: "Rae_shin88", url: "http://clawinst.com" },
  { name: "Nacian", x_handle: "0xdanielvigo", url: "https://nacian.app" },
  { name: "Soma", x_handle: "SachMoyne", url: "http://soma-edu.com" },
  { name: "TetherChat", x_handle: "SmallFryAI", url: "https://tetherchat.io" },
  { name: "Gridly", x_handle: "AdiKodez", url: "http://gridly.akoder.xyz" },
  { name: "Hexpandify", x_handle: "ZahrDaniel", url: "https://app.hexpandify.com" },
  { name: "LLMSearchInsight", x_handle: "UserSimLab", url: "http://llmsearchinsight.com" },
  { name: "Overspend", x_handle: "stevesolojourn", url: "http://Overspend.me" },
  { name: "SnipAI", x_handle: "Emmanuel0808177", url: "https://getsnipai.vercel.app" },
  { name: "InvoiceQuick", x_handle: "IftikharSherwa2", url: "https://invoicequick.app" },
  { name: "Preto", x_handle: "gauravdagde", url: "https://preto.ai" },
  { name: "StratLab", x_handle: "vish8287", url: "https://stratlab.in" },
];

function logoUrl(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
  }
}

async function seed() {
  console.log("Wiping database...");
  await db.delete(schema.votes);
  await db.delete(schema.reviews);
  await db.delete(schema.projects);

  console.log("Seeding projects (all in_queue)...");

  const projectValues = PROJECTS.map((p, i) => ({
    id: `proj-${i + 1}`,
    slug: slugify(p.name),
    name: p.name,
    logoUrl: logoUrl(p.url),
    url: p.url,
    description: "",
    xHandle: p.x_handle,
    tags: [] as string[],
    status: "in_queue" as const,
    upvotes: 0,
    queueOrder: i,
    featured: false,
    toolsIUse: false,
    bestLastWeek: false,
    createdAt: new Date(),
  }));

  await db.insert(schema.projects).values(projectValues);
  console.log(`Inserted ${projectValues.length} projects — all in_queue, 0 upvotes, sequential order`);
  console.log("No reviews inserted. Use admin to set first project to in_review.");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
