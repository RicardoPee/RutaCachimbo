import { getMockExamQuestions } from "@/actions/mock-exam-actions";
import { MockExamClient } from "./mock-exam-client";
import { redirect } from "next/navigation";

export default async function SimulacroPlayPage({ searchParams }: { searchParams: { uni?: string } }) {
  const result = await getMockExamQuestions(searchParams.uni);

  if (result.error || !result.questions) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-4">No hay preguntas disponibles</h1>
        <p className="text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col pt-6">
      <MockExamClient initialQuestions={result.questions} universityId={searchParams.uni} />
    </div>
  );
}
