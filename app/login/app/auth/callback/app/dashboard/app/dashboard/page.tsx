import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import DashboardCard from "@/components/dashboard-card";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  const { count: tasksHoje } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "pending")
    .gte("due_date", new Date().toISOString().split("T")[0]);

  const { count: clientesAtivos } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user?.id);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, status")
    .eq("user_id", user?.id);

  const aReceber = invoices
    ?.filter((i) => i.status === "pending")
    .reduce((acc, i) => acc + Number(i.amount), 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Olá, {user?.email?.split("@")[0]} 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <DashboardCard title="Tarefas Hoje" value={tasksHoje ?? 0} color="blue" />
        <DashboardCard title="Clientes Ativos" value={clientesAtivos ?? 0} color="green" />
        <DashboardCard title="A Receber" value={`R$ ${aReceber.toFixed(2)}`} color="purple" />
        <DashboardCard title="Pendências" value={invoices?.filter((i) => i.status === "overdue").length ?? 0} color="red" />
      </div>
    </div>
  );
}
