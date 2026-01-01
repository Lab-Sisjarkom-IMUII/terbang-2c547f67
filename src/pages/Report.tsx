import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockProducts } from "@/lib/mockData";
import { toast } from "sonner";

const Report = () => {
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

  const handleExportPDF = () => {
    toast.success("Laporan PDF akan segera didownload (fitur demo)");
  };

  const handleExportExcel = () => {
    toast.success("Laporan Excel akan segera didownload (fitur demo)");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
            <p className="text-muted-foreground">Periode: 7 hari terakhir</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="secondary">
              📄 Export PDF
            </Button>
            <Button onClick={handleExportExcel} className="bg-gradient-primary">
              📊 Export Excel
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-left py-3 px-4">Produk</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-right py-3 px-4">Stok</th>
                  <th className="text-right py-3 px-4">Harga</th>
                  <th className="text-right py-3 px-4">Total Nilai</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map((product) => (
                  <tr key={product.id} className="border-b border-primary/5 hover:bg-accent/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                    <td className="py-3 px-4 text-right">{product.stock}</td>
                    <td className="py-3 px-4 text-right">Rp {product.price.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      Rp {(product.stock * product.price).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock > 20 
                          ? 'bg-status-safe/20 text-status-safe' 
                          : product.stock > 0 
                          ? 'bg-status-warning/20 text-status-warning'
                          : 'bg-status-danger/20 text-status-danger'
                      }`}>
                        {product.stock > 20 ? 'Aman' : product.stock > 0 ? 'Menipis' : 'Habis'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Report;

