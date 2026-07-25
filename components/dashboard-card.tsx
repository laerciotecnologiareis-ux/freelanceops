interface DashboardCardProps {
  title: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "red";
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  red: "bg-red-50 text-red-700 border-red-200",
};

export default function DashboardCard({ title, value, color }: DashboardCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${colorStyles[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
