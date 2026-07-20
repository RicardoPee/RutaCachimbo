"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { 
  Plus, FolderOpen, BookOpen, GraduationCap, ChevronDown, ChevronUp, 
  Edit3, Trash2, CheckCircle2, Save, X, Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClassroomCourse } from "@/actions/classrooms";
import { 
  updateLessonTitle, deleteLesson, 
  updateChallengeText, deleteChallenge, 
  updateChallengeOptions 
} from "@/actions/teacher-editor";
import { UploadPdfButton } from "./upload-btn";

type OptionData = {
  id: number;
  text: string;
  correct: boolean;
};

type ChallengeData = {
  id: number;
  question: string;
  order: number;
  type: string;
  challengeOptions?: OptionData[];
};

type LessonWithChallenges = {
  id: number;
  title: string;
  referenceText: string | null;
  challenges: ChallengeData[];
};

type UnitWithLessons = {
  id: number;
  title: string;
  lessons: LessonWithChallenges[];
};

type CourseWithUnits = {
  id: number;
  title: string;
  imageSrc: string;
  units: UnitWithLessons[];
};

type ClassroomWithCourses = {
  id: number;
  name: string;
  description: string | null;
  inviteCode: string;
  courses: CourseWithUnits[];
};

export const ClassroomCoursesList = ({ classrooms }: { classrooms: ClassroomWithCourses[] }) => {
  const [activeClassroomId, setActiveClassroomId] = useState<number | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  // Editor states
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonText, setEditLessonText] = useState("");

  const [editingChallengeId, setEditingChallengeId] = useState<number | null>(null);
  const [editChallengeText, setEditChallengeText] = useState("");
  const [editChallengeOptions, setEditChallengeOptions] = useState<Omit<OptionData, "id">[]>([]);

  const handleCreateCourse = (classroomId: number) => {
    if (!newCourseTitle.trim()) return;

    startTransition(() => {
      createClassroomCourse(classroomId, newCourseTitle)
        .then(() => {
          toast.success("Curso creado exitosamente.");
          setNewCourseTitle("");
        })
        .catch(() => toast.error("Error al crear el curso."));
    });
  };

  const handleUpdateLesson = (id: number) => {
    if (!editLessonTitle.trim()) return;

    startTransition(() => {
      updateLessonTitle(id, editLessonTitle, editLessonText)
        .then(() => {
          toast.success("Lectura modificada exitosamente.");
          setEditingLessonId(null);
        })
        .catch(() => toast.error("Error al actualizar la lectura."));
    });
  };

  const handleDeleteLesson = (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta lectura y todas sus preguntas?")) return;

    startTransition(() => {
      deleteLesson(id)
        .then(() => {
          toast.success("Lectura eliminada.");
        })
        .catch(() => toast.error("Error al eliminar la lectura."));
    });
  };

  const handleUpdateChallenge = (id: number) => {
    if (!editChallengeText.trim()) return;

    startTransition(() => {
      Promise.all([
        updateChallengeText(id, editChallengeText),
        updateChallengeOptions(id, editChallengeOptions)
      ])
      .then(() => {
        toast.success("Pregunta y alternativas actualizadas.");
        setEditingChallengeId(null);
      })
      .catch(() => toast.error("Error al actualizar la pregunta."));
    });
  };

  const handleDeleteChallenge = (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) return;

    startTransition(() => {
      deleteChallenge(id)
        .then(() => {
          toast.success("Pregunta eliminada.");
        })
        .catch(() => toast.error("Error al eliminar la pregunta."));
    });
  };

  const openLessonEditor = (lesson: LessonWithChallenges) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonText(lesson.referenceText || "");
  };

  const openChallengeEditor = (challenge: ChallengeData) => {
    setEditingChallengeId(challenge.id);
    setEditChallengeText(challenge.question);
    setEditChallengeOptions(
      challenge.challengeOptions?.map(o => ({ text: o.text, correct: o.correct })) || []
    );
  };

  const handleAddOption = () => {
    setEditChallengeOptions([...editChallengeOptions, { text: "", correct: false }]);
  };

  const handleRemoveOption = (index: number) => {
    setEditChallengeOptions(editChallengeOptions.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, field: "text" | "correct", value: any) => {
    const updated = [...editChallengeOptions];
    if (field === "correct" && value === true) {
      // Solo una opción correcta por pregunta
      updated.forEach((opt, idx) => {
        opt.correct = idx === index;
      });
    } else {
      (updated[index] as any)[field] = value;
    }
    setEditChallengeOptions(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-700 mb-4">
        Aulas Activas y Asignaturas (Editor del Profesor)
      </h2>

      {classrooms.length === 0 ? (
        <p className="text-neutral-500">Aún no has creado ninguna aula.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {classrooms.map((cls) => {
            const isActive = activeClassroomId === cls.id;
            return (
              <div 
                key={cls.id} 
                className="bg-card border-2 border-slate-200 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-teal-600" />
                      <h3 className="font-extrabold text-xl text-neutral-700">{cls.name}</h3>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">{cls.description || "Sin descripción"}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl shrink-0">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Código de Invitación</p>
                      <p className="font-mono text-lg font-black text-blue-600 tracking-wider">{cls.inviteCode}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-2 text-sm">
                      <FolderOpen className="w-4 h-4 text-sky-500" />
                      Materias y Cursos ({cls.courses.length})
                    </h4>
                    
                    <Button 
                      size="sm" 
                      variant="primaryOutline"
                      onClick={() => setActiveClassroomId(isActive ? null : cls.id)}
                    >
                      {isActive ? "Ocultar Cursos" : "Gestionar Cursos"}
                    </Button>
                  </div>

                  {isActive && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {/* Formulario de Curso */}
                      <div className="flex gap-2 max-w-md bg-slate-50 dark:bg-slate-900/10 p-3 rounded-2xl border border-border">
                        <Input
                          placeholder="Nueva materia (ej. Razonamiento Matemático)"
                          value={newCourseTitle}
                          disabled={pending}
                          onChange={(e) => setNewCourseTitle(e.target.value)}
                          className="bg-card"
                        />
                        <Button 
                          disabled={pending}
                          onClick={() => handleCreateCourse(cls.id)}
                          size="sm"
                          variant="secondary"
                          className="shrink-0"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                      </div>

                      {/* Lista de Cursos */}
                      <div className="grid grid-cols-1 gap-6">
                        {cls.courses.map((course) => {
                          const isExpanded = expandedCourseId === course.id;
                          return (
                            <div 
                              key={course.id} 
                              className="border-2 border-border/80 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/10"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
                                  <h5 className="font-extrabold text-neutral-700 dark:text-neutral-300">
                                    {course.title}
                                  </h5>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                                >
                                  {isExpanded ? <><ChevronUp className="w-4 h-4 mr-1" /> Ocultar Temario</> : <><ChevronDown className="w-4 h-4 mr-1" /> Ver y Editar Contenido</>}
                                </Button>
                              </div>

                              {isExpanded && (
                                <div className="mt-4 space-y-6 border-t pt-4 animate-in slide-in-from-top-2 duration-300">
                                  {course.units.map(unit => (
                                    <div key={unit.id} className="space-y-3">
                                      <h6 className="font-extrabold text-xs text-neutral-400 uppercase tracking-wider">{unit.title}</h6>
                                      
                                      <div className="space-y-4 pl-3 border-l-2 border-indigo-100 dark:border-indigo-950">
                                        {unit.lessons.map(lesson => (
                                          <div key={lesson.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                                            {/* Cabecera Lección/Lectura */}
                                            {editingLessonId === lesson.id ? (
                                              <div className="space-y-2">
                                                <Input 
                                                  value={editLessonTitle}
                                                  onChange={(e) => setEditLessonTitle(e.target.value)}
                                                  placeholder="Título de la lectura"
                                                  className="font-bold text-sm"
                                                />
                                                <Textarea 
                                                  value={editLessonText}
                                                  onChange={(e) => setEditLessonText(e.target.value)}
                                                  placeholder="Texto completo de lectura"
                                                  className="text-xs"
                                                  rows={4}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                  <Button size="sm" variant="primary" onClick={() => handleUpdateLesson(lesson.id)}>
                                                    <Save className="w-3.5 h-3.5 mr-1" /> Guardar
                                                  </Button>
                                                  <Button size="sm" variant="ghost" onClick={() => setEditingLessonId(null)}>
                                                    <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex justify-between items-start gap-4">
                                                <div>
                                                  <p className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">{lesson.title}</p>
                                                  {lesson.referenceText && (
                                                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 italic">{lesson.referenceText}</p>
                                                  )}
                                                </div>
                                                <div className="flex gap-1">
                                                  <Button size="sm" variant="ghost" onClick={() => openLessonEditor(lesson)}>
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                  </Button>
                                                  <Button size="sm" variant="ghost" onClick={() => handleDeleteLesson(lesson.id)} className="text-rose-500 hover:text-rose-600">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )}

                                            {/* Preguntas de la Lección */}
                                            <div className="pl-4 space-y-3 border-l border-slate-200">
                                              {lesson.challenges.map(challenge => (
                                                <div key={challenge.id} className="bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-lg border border-border/80">
                                                  {editingChallengeId === challenge.id ? (
                                                    <div className="space-y-3">
                                                      <Input 
                                                        value={editChallengeText}
                                                        onChange={(e) => setEditChallengeText(e.target.value)}
                                                        className="font-semibold text-xs"
                                                      />
                                                      
                                                      {/* Alternativas */}
                                                      <div className="space-y-2">
                                                        <p className="text-[10px] font-bold text-neutral-400 uppercase">Alternativas de Respuesta</p>
                                                        {editChallengeOptions.map((opt, oIdx) => (
                                                          <div key={oIdx} className="flex items-center gap-2">
                                                            <input 
                                                              type="checkbox"
                                                              checked={opt.correct}
                                                              onChange={(e) => handleOptionChange(oIdx, "correct", e.target.checked)}
                                                              className="rounded border-slate-300 text-emerald-600 w-4 h-4"
                                                            />
                                                            <Input 
                                                              value={opt.text}
                                                              onChange={(e) => handleOptionChange(oIdx, "text", e.target.value)}
                                                              className="text-xs py-1 h-8"
                                                              placeholder={`Alternativa ${oIdx + 1}`}
                                                            />
                                                            <Button size="sm" variant="ghost" onClick={() => handleRemoveOption(oIdx)} className="text-rose-500">
                                                              <X className="w-3.5 h-3.5" />
                                                            </Button>
                                                          </div>
                                                        ))}
                                                        <Button size="sm" variant="secondaryOutline" onClick={handleAddOption} className="text-[10px] py-1 h-6">
                                                          + Agregar Alternativa
                                                        </Button>
                                                      </div>

                                                      <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="primary" onClick={() => handleUpdateChallenge(challenge.id)}>
                                                          <Save className="w-3.5 h-3.5 mr-1" /> Guardar
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingChallengeId(null)}>
                                                          <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div className="space-y-2">
                                                      <div className="flex justify-between items-start gap-4">
                                                        <p className="font-semibold text-xs text-neutral-600 dark:text-neutral-400">{challenge.question}</p>
                                                        <div className="flex gap-1 shrink-0">
                                                          <Button size="sm" variant="ghost" onClick={() => openChallengeEditor(challenge)}>
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                          </Button>
                                                          <Button size="sm" variant="ghost" onClick={() => handleDeleteChallenge(challenge.id)} className="text-rose-500">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </Button>
                                                        </div>
                                                      </div>

                                                      {/* Listar opciones de solo lectura */}
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                                        {challenge.challengeOptions?.map(opt => (
                                                          <div key={opt.id} className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1.5 ${opt.correct ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold border-emerald-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                            {opt.correct && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                                                            <span className="truncate">{opt.text}</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}

                                              {lesson.challenges.length === 0 && (
                                                <p className="text-xs text-neutral-400 italic">No hay preguntas registradas para esta lección.</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}

                                        {unit.lessons.length === 0 && (
                                          <p className="text-xs text-neutral-400 italic pl-3">Aún no hay lecturas en este nivel.</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] text-neutral-400 font-bold mb-1.5 uppercase">Añadir Lecciones con IA</p>
                                <UploadPdfButton courseId={course.id} />
                              </div>
                            </div>
                          );
                        })}

                        {cls.courses.length === 0 && (
                          <p className="text-neutral-500 text-xs italic p-2">No has agregado ninguna materia a esta aula aún.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
