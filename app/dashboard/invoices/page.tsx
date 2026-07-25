"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Search, Check, X, Clock, DollarSign } from "lucide-react";

type Invoice = {
  id: string;
  client_id: string | null;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  description: string | null;
  created_at: string;
  client?: { name: string } | null;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadInvoices();
    loadClients();
  }, []);

  const loadInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("invoices")
      .select("*, client:clients(name)")
      .eq("user_id", user.id)
      .order("due_date", { ascending: false });

    setInvoices(data ?? []);
  };

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");

    setClients(data ?? []);
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("invoices").insert({
      user_id: user.id,
      client_id: clientId || null,
      amount: parseFloat(amount),
      due_date: dueDate,
      status: "pending",
      description,
    });

    setAmount("");
    setDueDate("");
    setDescription("");
    setClientId("");
    setShowForm(false);
    loadInvoices();
  };

  const markAsPaid = async (id: string) => {
    await supabase.from("invoices").update({ status: "paid" }).eq("id", id);
    loadInvoices();
  };

  const markAsOverdue = async (id: string) => {
    await supabase.from("invoices").update({ status: "overdue" }).eq("id", id);
    loadInvoices();
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch = inv.client?.name?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((acc, i) => acc + Number(i.amount), 0);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };
  const statusLabels = {
    pending: "Pendente",
    paid: "Pago",
    overdue: "Atrasado",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cobranças</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nova cobrança
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-blue-600" />
          <span className="text-sm text-gray-500">Total a receber:</span>
          <span className="text-xl font-bold text-gray-900">R$ {totalPending.toFixed(2)}</span>
        </div>
      </div>

      {showForm && (
        <form onSubmit={createInvoice} className="bg-white p-6 rounded-xl shadow-sm mb-6 space-y-4">
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Selecione um cliente (opcional)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Salvar
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {(["all", "pending", "paid", "overdue"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {s === "all" ? "Todas" : s === "pending" ? "Pendentes" : s === "paid" ? "Pagas" : "Atrasadas"}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((inv) => (
          <div key={inv.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {inv.client?.name ?? "Cliente removido"}
              </p>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span>R$ {Number(inv.amount).toFixed(2)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {new Date(inv.due_date).toLocaleDateString("pt-BR")}
                </span>
                {inv.description && <span>{inv.description}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[inv.status]}`}>
                {statusLabels[inv.status]}
              </span>
              {inv.status === "pending" && (
                <>
                  <button onClick={() => markAsPaid(inv.id)} className="text-green-500 hover:text-green-700" title="Marcar como pago">
                    <Check size={18} />
                  </button>
                  <button onClick={() => markAsOverdue(inv.id)} className="text-red-400 hover:text-red-600" title="Marcar como atrasado">
                    <X size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhuma cobrança encontrada.</p>
        )}
      </div>
    </div>
  );
}
