"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/dashboard"];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    pathname.startsWith(route),
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}
