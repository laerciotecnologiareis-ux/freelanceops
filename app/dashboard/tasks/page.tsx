"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import type { Task } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"hoje" | "semana" | "todas" | "concluidas">("todas");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "media" as const, due_date: "" });

  useEffect(() => {
    loadTasks();
  }, [filter]);

  async function loadTasks() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    const hoje = new Date().toISOString().split("T")[0];

    if (filter === "hoje") query = query.eq("due_date", hoje);
    else if (filter === "semana") {
      const semana = new Date();
      semana.setDate(semana.getDate() + 7);
      query = query.gte("due_date", hoje).lte("due_date", semana.toISOString().split("T")[0]);
    } else if (filter === "concluidas") query = query.eq("status", "concluida");
    else query = query.neq("status", "concluida");

    const { data } = await query.order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newTask.title) return;

    await supabase.from("tasks").insert({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      user_id: user.id,
    });

    setNewTask({ title: "", description: "", priority: "media", due_date: "" });
    setShowCreate(false);
    loadTasks();
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === "concluida" ? "pendente" : "concluida";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    loadTasks();
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    loadTasks();
  }

  const filters = [
    { key: "todas", label: "Pendentes" },
    { key: "hoje", label: "Hoje" },
    { key: "semana", label: "Semana" },
    { key: "concluidas", label: "Concluídas" },
  ] as const;

  const priorityColors: Record<string, string> = {
    baixa: "bg-green-100 text-green-700",
    media: "bg-yellow-100 text-yellow-700",
    alta: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> Nova Tarefa
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === f.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Título da tarefa"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={2}
            />
            <div className="flex gap-4">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "baixa" | "media" | "alta" })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Criar
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma tarefa encontrada.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <button onClick={() => toggleStatus(task)} className={`flex h-5 w-5 items-center justify-center rounded border ${
                task.status === "concluida" ? "border-green-500 bg-green-500 text-white" : "border-gray-300"
              }`}>
                {task.status === "concluida" && <CheckSquare className="h-4 w-4" />}
              </button>

              <div className="flex-1">
                <p className={`text-sm font-medium ${task.status === "concluida" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {task.title}
                </p>
                {task.description && <p className="text-xs text-gray-500">{task.description}</p>}
                {task.due_date && <p className="text-xs text-gray-400">Vence: {new Date(task.due_date).toLocaleDateString("pt-BR")}</p>}
              </div>

              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>

              <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
