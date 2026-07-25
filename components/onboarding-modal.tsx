"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const questions = [
  {
    question: "Qual seu principal ramo de atuação?",
    options: ["Design / Criativo", "Desenvolvimento / TI", "Consultoria", "Marketing / Conteúdo", "Outro"],
    key: "area",
  },
  {
    question: "Quantos clientes ativos você tem?",
    options: ["1 a 5", "6 a 15", "16 a 30", "Mais de 30"],
    key: "clientes",
  },
  {
    question: "Qual maior desafio hoje?",
    options: ["Organizar tarefas", "Controlar cobranças", "Gerenciar clientes", "Tudo ao mesmo tempo"],
    key: "desafio",
  },
];

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  if (!open) return null;

  const handleAnswer = async (answer: string) => {
    const updated = { ...answers, [questions[step].key]: answer };
    setAnswers(updated);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      await supabase.from("user_profiles").upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        onboarding_data: updated,
        onboarding_complete: true,
      });
      router.refresh();
      onClose();
    }
  };

  const q = questions[step];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <=
