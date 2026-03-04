"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react'; // 1. Importamos Suspense
import { useSearchParams } from "next/navigation";
import { Box } from "@chakra-ui/react";
import CreatePassword from "./reset-password";

// Renombramos el componente original a Content
const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const linkId = searchParams.get("linkId") ?? "";

  return <CreatePassword token={token} linkId={linkId} />;
};

// 2. Exportación con el límite de Suspense
// Esto evita que Vercel intente adivinar el token durante el build
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box p={10}>Validando enlace de recuperación...</Box>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
