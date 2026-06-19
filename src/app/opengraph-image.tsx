import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HiQueue - Queue Management System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 800,
              color: "white",
            }}
          >
            HQ
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "white",
            }}
          >
            HiQueue
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          Serve people better,
          <br />
          one ticket at a time.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            marginTop: "24px",
            maxWidth: "700px",
          }}
        >
          Free queue management for clinics, banks, government offices, and
          service desks.
        </p>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#64748b",
            fontSize: "18px",
          }}
        >
          hi-queue.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
