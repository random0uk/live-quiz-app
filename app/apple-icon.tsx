import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "#7c3aed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M13 2L4.5 13.5H11L9 22L19.5 10.5H13L13 2Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
