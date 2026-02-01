"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from 'react'; // 1. Importamos Suspense
import { Td, Tr, Box } from "@chakra-ui/react";
import { useState } from "react";
import GenericTable from "../../common/components/generic-table";
import { CareerStudent } from "./interfaces/career-student.interface";

// Renombramos el componente original a Content
const CarreraContent: React.FC = () => {
  const [career, setCareer] = useState<CareerStudent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const TableHeader = ["Nombre Carrera", "Estado", "Año de ingreso"];

  const renderCarrerRow = (careerStudent: CareerStudent) => {
    return (
      <Tr key={careerStudent.id}>
        <Td>{careerStudent.Career.name}</Td>
        <Td>{careerStudent.active ? "activo" : "inactivo"}</Td>
        <Td>{new Date(careerStudent.student.yearEntry).getFullYear()}</Td>
      </Tr>
    );
  };

  return (
    <>
      {error && <p>{error}</p>}
      {career ? (
        <GenericTable
          data={career}
          TableHeader={TableHeader}
          renderRow={renderCarrerRow}
          caption="Carrera"
        />
      ) : (
        <p>Loading....</p>
      )}
    </>
  );
};

// 2. Exportación con el límite de Suspense para evitar errores de compilación en Vercel
export default function CarreraPage() {
  return (
    <Suspense fallback={<Box p={10}>Cargando información de carrera...</Box>}>
      <CarreraContent />
    </Suspense>
  );
}
