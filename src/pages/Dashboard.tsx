import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import StatsCard from "@/components/StatsCard";
import SalesChart from "@/components/SalesChart";
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/lib/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  const totalProducts = mockProducts.length;
  const lowStock = mockProducts.filter(p => p.stock <= 10).length;
  const outOfStock = mockProducts.filter(p => p.stock === 0).length;
  const totalValue = mockProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Produk"
            value={totalProducts}
            icon="📦"
            trend="+5 minggu ini"
            status="safe"
          />
          <StatsCard
            title="Stok Menipis"
            value={lowStock}
            icon="⚠️"
            trend="Perlu restok"
            status="warning"
          />
          <StatsCard
            title="Stok Habis"
            value={outOfStock}
            icon="🚫"
            trend="Segera order"
            status="danger"
          />
          <StatsCard
            title="Total Nilai"
            value={`Rp ${totalValue.toLocaleString('id-ID')}`}
            icon="💰"
            trend="+12% bulan ini"
            status="safe"
          />
        </div>

        {/* Sales Chart */}
        <div className="bg-card rounded-xl p-6 border border-primary/10 shadow-elegant">
          <h2 className="text-xl font-semibold mb-4">Tren Penjualan 7 Hari</h2>
          <SalesChart />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate("/scan")}
            className="bg-gradient-primary hover:opacity-90"
          >
            📸 Scan Produk
          </Button>
          <Button 
            onClick={() => navigate("/report")}
            variant="secondary"
          >
            📊 Lihat Laporan
          </Button>
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Produk Terbaru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

