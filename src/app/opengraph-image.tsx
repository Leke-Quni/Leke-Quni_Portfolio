import { ImageResponse } from "next/og";

export const alt = "Leke Quni · Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#030a1c",
          color: "#c3cde0",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>Leke Quni</div>
        <div style={{ marginTop: 16, fontSize: 40, opacity: 0.7 }}>
          Portfolio · solo and team projects
        </div>
      </div>
    ),
    size,
  );
}
