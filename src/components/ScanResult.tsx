import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ScanResultProps {
  result: {
    name: string;
    category: string;
    type: string;
    confidence: number;
    stock: number;
    status: string;
    salesTrend: string;
    insight: string;
    image: string;
  };
  onScanAgain: () => void;
}

const ScanResult = ({ result, onScanAgain }: ScanResultProps) => {
  const getStatusColor = () => {
    if (result.stock === 0) return "bg-status-danger/20 text-status-danger";
    if (result.stock <= 10) return "bg-status-warning/20 text-status-warning";
    return "bg-status-safe/20 text-status-safe";
  };

  return (
    <Card className="p-6 space-y-6 border-primary/20 shadow-elegant">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hasil Scan</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Akurasi:</span>
          <span className="font-bold text-primary">{(result.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-square rounded-lg overflow-hidden bg-accent/50">
          <img 
            src={result.image} 
            alt={result.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold">{result.name}</h3>
            <p className="text-muted-foreground">{result.category} • {result.type}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
              <span className="text-sm">Sisa Stok</span>
              <span className="font-bold text-lg">{result.stock} unit</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
              <span className="text-sm">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {result.stock > 20 ? 'Aman' : result.stock > 0 ? 'Menipis' : 'Habis'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
              <span className="text-sm">Tren Penjualan</span>
              <span className="font-medium text-status-safe">{result.salesTrend}</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-semibold text-sm mb-1">AI Insight</p>
                <p className="text-sm text-muted-foreground">{result.insight}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="secondary"
          onClick={onScanAgain}
        >
          ⬅️ Kembali
        </Button>
        <Button 
          onClick={onScanAgain}
          className="bg-gradient-primary hover:opacity-90"
        >
          📸 Scan Lagi
        </Button>
        <Button variant="secondary">
          💾 Simpan ke Database
        </Button>
      </div>
    </Card>
  );
};

export default ScanResult;
