"use client";
export const dynamic = 'force-dynamic'; // <--- AGREGADO PARA EL BUILD DE VERCEL

import { useSearchParams } from "next/navigation";
import CreatePassword from "./reset-password";

const Page = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const linkId = searchParams.get("linkId") ?? "";

  return <CreatePassword token={token} linkId={linkId} />;
};

export default Page;
