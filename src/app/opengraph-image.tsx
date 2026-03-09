import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WeekendCheck — Real feedback on early projects";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: "72px 80px",
        }}
      >
        {/* Top — accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "linear-gradient(90deg, #ff6b35 0%, #ff6b35 40%, transparent 100%)",
          }}
        />

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: "80px",
              fontWeight: 900,
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "#ffffff" }}>weekend</span>
            <span style={{ color: "#ff6b35" }}>check</span>
          </div>

          <div
            style={{
              marginTop: "24px",
              fontSize: "30px",
              color: "#666",
              lineHeight: 1.4,
            }}
          >
            real feedback on early projects. every weekend.
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #222",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "40px", fontSize: "18px" }}>
            <span style={{ color: "#ff6b35" }}>submit</span>
            <span style={{ color: "#666" }}>→</span>
            <span style={{ color: "#fff" }}>upvote</span>
            <span style={{ color: "#666" }}>→</span>
            <span style={{ color: "#2d8a4e" }}>get reviewed</span>
          </div>
          <span style={{ fontSize: "16px", color: "#444" }}>@0x_null_dev</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
