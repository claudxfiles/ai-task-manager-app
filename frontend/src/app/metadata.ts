import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Manager AI",
  description: "Planifica tu futuro con la ayuda de IA avanzada. Convierte tus metas en planes accionables y alcanza tu máximo potencial.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/manifest.json",
}; 