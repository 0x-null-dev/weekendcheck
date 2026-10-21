import { ogImage, ogSize } from "@/lib/og-image";
import { xHandle } from "@/lib/site";

export const alt = "0xAlex Check: I want to try what you're building.";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ kicker: "0xAlex checks what people build", title: "I want to try what you're building.", footer: `check.0xalex.com · @${xHandle}` });
}
