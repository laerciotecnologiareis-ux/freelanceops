export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pendente" | "em_andamento" | "concluida";
  priority: "baixa" | "media" | "alta";
  due_date?: string;
  client_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  amount: number;
  status: "pendente" | "pago" | "atrasado";
  due_date: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
