"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createFaction, updateFaction, deleteFaction } from "@/actions/faction-actions";
import { useRouter } from "next/navigation";

export const FactionAdminClient = ({ initialFactions }: { initialFactions: any[] }) => {
  const router = useRouter();
  const [factions, setFactions] = useState(initialFactions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ name: "", description: "", logoSrc: "" });

  const startEdit = (faction: any) => {
    setEditingId(faction.id);
    setIsCreating(false);
    setFormData({ name: faction.name, description: faction.description, logoSrc: faction.logoSrc });
  };

  const startCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setFormData({ name: "", description: "", logoSrc: "/shield.svg" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.logoSrc) {
      toast.error("Llena todos los campos");
      return;
    }
    setLoading(true);

    let res;
    if (isCreating) {
      res = await createFaction(formData);
    } else if (editingId) {
      res = await updateFaction(editingId, formData);
    }

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(isCreating ? "Facción creada" : "Facción actualizada");
      setEditingId(null);
      setIsCreating(false);
      router.refresh();
      // Temporary state update until refresh hits
      setTimeout(() => window.location.reload(), 500);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta facción? Podría causar errores si tiene miembros.")) return;
    setLoading(true);
    const res = await deleteFaction(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Facción eliminada");
      router.refresh();
      setTimeout(() => window.location.reload(), 500);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-700">Facciones Actuales</h2>
        {!isCreating && !editingId && (
          <Button onClick={startCreate} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" /> Agregar Nueva Facción
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200 mb-8">
          <h3 className="font-bold text-slate-700 mb-4">{isCreating ? "Crear Nueva Facción" : "Editar Facción"}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre (Ej: San Marcos)</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Nombre de la Universidad"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
              <Input 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Descripción corta o lema"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Ruta del Logo / SVG</label>
              <Input 
                value={formData.logoSrc} 
                onChange={e => setFormData({ ...formData, logoSrc: e.target.value })} 
                placeholder="/shield.svg (Ruta en public/ o URL)"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar
              </Button>
              <Button onClick={cancelEdit} variant="primaryOutline" disabled={loading}>
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {factions.map(faction => (
          <div key={faction.id} className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-4">
              <img src={faction.logoSrc} alt="logo" className="w-12 h-12 object-cover rounded-md" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{faction.name}</h3>
                <p className="text-slate-500 text-sm">{faction.description}</p>
                <div className="mt-1 flex gap-3 text-xs font-bold text-slate-400">
                   <span>ID: {faction.id}</span>
                   <span>•</span>
                   <span>{faction._count.members} Miembros</span>
                   <span>•</span>
                   <span>{faction.totalXp} XP Acumulada</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => startEdit(faction)} disabled={loading} className="text-indigo-600 hover:bg-indigo-50">
                <Edit2 className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(faction.id)} disabled={loading || faction._count.members > 0} className="text-rose-500 hover:bg-rose-50" title={faction._count.members > 0 ? "No puedes eliminar una facción con miembros" : "Eliminar"}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
        {factions.length === 0 && <p className="text-slate-500 italic">No hay facciones creadas todavía.</p>}
      </div>
    </div>
  );
};
