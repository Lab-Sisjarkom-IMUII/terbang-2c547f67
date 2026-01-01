import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend: string;
  status: "safe" | "warning" | "danger";
}

const StatsCard = ({ title, value, icon, trend, status }: StatsCardProps) => {
  const getBorderColor = () => {
    switch (status) {
      case "safe": return "border-status-safe/30";
      case "warning": return "border-status-warning/30";
      case "danger": return "border-status-danger/30";
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "safe": return "text-status-safe";
      case "warning": return "text-status-warning";
      case "danger": return "text-status-danger";
    }
  };

  return (
    <Card className={`p-6 border-2 ${getBorderColor()} hover:shadow-elegant transition-all`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className={`text-xs ${getTextColor()}`}>{trend}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Card>
  );
};

export default StatsCard;

