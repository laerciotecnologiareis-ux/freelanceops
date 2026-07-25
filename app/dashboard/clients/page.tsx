import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { LayoutDashboard, CheckSquare, Users, DollarSign } from "lucide-react";

async function getMetrics() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { tasksHoje: 0, clientesAtivos: 0, aReceber: 0, pendencias: 0 };

  const hoje = new Date().toISOString().split("T")[0];

  const { count: tasksHoje } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("due_date", hoje);

  const { count: clientesAtivos } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, status")
    .eq("user_id", user.id);

  const aReceber = invoices?.filter(i => i.status === "pendente" || i.status === "atrasado")
    .reduce((acc, i) => acc + Number(i.amount), 0) ?? 0;

  const { count: pendencias } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .neq("status", "concluida");

  return { tasksHoje, clientesAtivos, aReceber, pendencias };
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  const cards = [
    { title: "Tarefas Hoje", value: metrics.tasksHoje, icon: CheckSquare, color: "blue" },
    { title: "Clientes Ativos", value: metrics.clientesAtivos, icon: Users, color: "green" },
    { title: "A Receber", value: `R$ ${metrics.aReceber.toFixed(2)}`, icon: DollarSign, color: "yellow" },
    { title: "Pendências", value: metrics.pendencias, icon: LayoutDashboard, color: "red" },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const colors = colorClasses[card.color];
          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
