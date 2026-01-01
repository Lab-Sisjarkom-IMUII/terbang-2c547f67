import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      const found = products.find((p: any) => p.id === id);
      setProduct(found);
    }
  }, [navigate, id]);

  const predictSales = () => {
    setLoading(true);
    
    // Mock AI Sales Predictor
    setTimeout(() => {
      const mockPrediction = {
        nextWeekSales: Math.floor(Math.random() * 100) + 50,
        trend: Math.random() > 0.5 ? "naik" : "stabil",
        confidence: (Math.random() * 20 + 80).toFixed(1),
        insight: "Berdasarkan tren penjualan 7 hari terakhir, produk ini diprediksi akan mengalami peningkatan penjualan sebesar 15% minggu depan.",
        weeklyData: [
          { day: "Senin", sales: Math.floor(Math.random() * 20) + 10 },
          { day: "Selasa", sales: Math.floor(Math.random() * 20) + 10 },
          { day: "Rabu", sales: Math.floor(Math.random() * 20) + 10 },
          { day: "Kamis", sales: Math.floor(Math.random() * 20) + 10 },
          { day: "Jumat", sales: Math.floor(Math.random() * 20) + 10 },
          { day: "Sabtu", sales: Math.floor(Math.random() * 20) + 10 },
          { day: "Minggu", sales: Math.floor(Math.random() * 20) + 10 },
        ]
      };
      
      setPrediction(mockPrediction);
      setLoading(false);
    }, 2000);
  };

  if (!user || !product) return null;

  const getStatusColor = () => {
    if (product.stock === 0) return "bg-status-danger/20 text-status-danger";
    if (product.stock <= 10) return "bg-status-warning/20 text-status-warning";
    return "bg-status-safe/20 text-status-safe";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Produk
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6">
            <div className="aspect-square rounded-lg overflow-hidden bg-accent/50">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground text-lg">{product.category}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Harga</p>
                  <p className="text-2xl font-bold">Rp {product.price.toLocaleString()}</p>
                </div>
                
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Stok</p>
                  <p className="text-2xl font-bold">{product.stock} unit</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {product.stock > 20 ? 'Aman' : product.stock > 0 ? 'Menipis' : 'Habis'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                <span className="text-sm">Tren Penjualan</span>
                <span className="font-medium text-status-safe">{product.salesTrend}</span>
              </div>

              {product.description && (
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Deskripsi</p>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              )}
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">🤖 AI Sales Predictor</h2>
                <Button 
                  onClick={predictSales}
                  disabled={loading}
                  className="bg-gradient-primary"
                  size="sm"
                >
                  {loading ? "Memprediksi..." : "Prediksi Penjualan"}
                </Button>
              </div>

              {prediction && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground">Prediksi Minggu Depan</p>
                      <p className="text-2xl font-bold">{prediction.nextWeekSales} unit</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold">{prediction.confidence}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold mb-2">💡 AI Insight</p>
                    <p className="text-sm text-muted-foreground">{prediction.insight}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Grafik Penjualan 7 Hari Terakhir</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={prediction.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;

