"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Check, Trash2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "done";
  client_id: string | null;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"today" | "week" | "all" | "done">("today");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (filter === "today") {
      query = query.eq("due_date", new Date().toISOString().split("T")[0]);
    } else if (filter === "week") {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + 7);
      query = query.lte("due_date", weekEnd.toISOString().split("T")[0]);
    } else if (filter === "done") {
      query = query.eq("status", "done");
    } else {
      query = query.eq("status", "pending");
    }

    const { data } = await query;
    setTasks(data ?? []);
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    loadTasks();
  };

  const deleteTask = async (id: string)
