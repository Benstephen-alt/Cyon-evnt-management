export const BADGE_CONFIG = {
  template: "src/assets/badge-template.png",

  canvas: {
    width: 1024,
    height: 1536,
  },

  // Name
  name: {
    x: 245,
    y: 835,
    width: 360,
    fontSize: 33,
    color: "#0B5E2E",
  },

  // Parish (supports automatic 2-line wrapping)
  parish: {
    x: 255,
    y: 890,
    width: 420,
    fontSize: 33,
    color: "#0B5E2E",
  },

  // Delegate ID
  delegateId: {
    x: 200,
    y: 1025,
    width: 375,
    fontSize: 32,
    color: "#0B5E2E",
  },

  // QR Code
  qr: {
    x: 520,
    y: 810,
    size: 300,
  },
};