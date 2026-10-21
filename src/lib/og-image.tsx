import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
const assets = path.join(process.cwd(), "src/assets");

// Share card in the homepage style: copy on cream, portrait on the sky-blue panel.
export async function ogImage({ kicker, title, subtitle, footer }: { kicker: string; title: string; subtitle?: string; footer: string }) {
  const [regular, bold, portrait] = await Promise.all([
    readFile(path.join(assets, "fonts/dm-sans-latin-400-normal.woff")),
    readFile(path.join(assets, "fonts/dm-sans-latin-700-normal.woff")),
    readFile(path.join(assets, "og-portrait.png")),
  ]);
  const titleSize = title.length > 40 ? 64 : title.length > 18 ? 80 : 104;
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#fffaf0", color: "#1d3444", fontFamily: "DM Sans" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "68px 64px 60px 72px" }}>
        <div style={{ display: "flex", color: "#557181", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>{kicker.toUpperCase()}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, letterSpacing: titleSize * -0.06, lineHeight: 0.95 }}>{title}</div>
          {subtitle && <div style={{ display: "flex", marginTop: 26, maxWidth: 640, color: "#3f5869", fontSize: 32, lineHeight: 1.25 }}>{subtitle.length > 110 ? `${subtitle.slice(0, 107).trimEnd()}…` : subtitle}</div>}
        </div>
        <div style={{ display: "flex", color: "#557181", fontSize: 24 }}>{footer}</div>
      </div>
      <div style={{ display: "flex", width: 420, height: "100%", background: "#dcecf5", borderLeft: "2px solid #c8d3da" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/png;base64,${portrait.toString("base64")}`} width={420} height={630} alt="" />
      </div>
    </div>,
    { ...ogSize, fonts: [{ name: "DM Sans", data: regular, weight: 400 }, { name: "DM Sans", data: bold, weight: 700 }] },
  );
}
