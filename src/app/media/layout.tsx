// src/app/media/layout.tsx
import MediaLayoutClient from "@/components/midea/MediaLayoutClient";
import React from "react";

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MediaLayoutClient>{children}</MediaLayoutClient>;
}
