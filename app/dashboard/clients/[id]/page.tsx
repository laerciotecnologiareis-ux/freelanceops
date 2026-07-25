import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2, Calendar, FileText } from "lucide-react";
import Link from "next/link";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user?.id)
    .single();

  if (!client) return notFound();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("client_id", params.id)
    .order("due_date", { ascending: true });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href="/dashboard/clients" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Voltar para clientes
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {client.email && (
            <span className="flex items-center gap-1"><Mail size={16} /> {client.email}</span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1"><Phone size={16} /> {client.phone}</span>
          )}
          {client.company && (
            <span className="flex items-center gap-1"><Building2 size={16} /> {client.company}</span>
          )}
        </div>
        {client.notes && (
          <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{client.notes}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FileText size={18} /> Tarefas Vinculadas
          </h2>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className={`text-sm ${task.status === "done" ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === "high" ? "bg-red-100 text-red-700" :
                    task.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nenhuma tarefa vinculada.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Calendar size={18} /> Cobranças Vinculadas
          </h2>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {new Date(inv.due_date).toLocaleDateString("pt-BR")} — R$ {Number(inv.amount).toFixed(2)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    inv.status === "paid" ? "bg-green-100 text-green-700" :
                    inv.status === "overdue" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {inv.status === "paid" ? "Pago" : inv.status === "overdue" ? "Atrasado" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nenhuma cobrança vinculada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
