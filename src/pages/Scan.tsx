import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import ScanResult from "@/components/ScanResult";

type User = { name: string; email: string; avatar: string };
type Product = { name: string; category: string; stock: number; salesTrend?: string; image?: string };
type ScanResultData = {
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

const Scan = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [notFound, setNotFound] = useState<{ name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const toDataUrl = (f: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });

      const dataUrl = await toDataUrl(file);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });

      if (!res.ok) throw new Error("Gagal memproses gambar dengan AI");
      const data = await res.json();

      const productsData = localStorage.getItem("products");
      const products: Product[] = productsData ? JSON.parse(productsData) : [];

      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
      const target = norm(data.name || "");
      const found = products.find((p: Product) => {
        const pn = norm(p.name || "");
        return pn.includes(target) || target.includes(pn);
      });

      if (found) {
        setResult({
          name: found.name,
          category: found.category,
          type: found.category,
          confidence: typeof data.confidence === "number" ? data.confidence : 0.8,
          stock: found.stock,
          status: found.stock > 20 ? "safe" : found.stock > 0 ? "warning" : "danger",
          salesTrend: found.salesTrend || "+0%",
          insight: data.insight || "Produk teridentifikasi",
          image: found.image || dataUrl,
        });
        toast.success("Produk ditemukan di katalog");
      } else {
        setNotFound({ name: data.name || "Produk" });
        setResult(null);
        toast.info("Barang tidak tersedia dalam katalog");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menganalisis gambar");
    } finally {
      setScanning(false);
      // Reset input value so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] safe-area bg-background">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Scan Produk</h1>
            <p className="text-muted-foreground">
              Upload atau ambil foto produk untuk mengenali dan cek stok
            </p>
          </div>

          {!result && !notFound && (
            <Card className="p-8 space-y-6 border-dashed border-2 border-primary/30">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={scanning}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {scanning ? "Memproses..." : "📸 Ambil Foto / Upload"}
                </Button>

                {scanning && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    AI Vision sedang menganalisis gambar...
                  </div>
                )}
              </div>
            </Card>
          )}

          {notFound && (
            <Card className="p-8 space-y-4">
              <h2 className="text-2xl font-bold">Barang tidak tersedia</h2>
              <p className="text-muted-foreground">{notFound.name} tidak ditemukan di katalog produk Anda.</p>
              <div className="flex gap-3">
                <Button
                  className="bg-gradient-primary"
                  onClick={() => {
                    navigate(`/products?add=${encodeURIComponent(notFound.name)}`);
                  }}
                >
                  ➕ Tambah Barang
                </Button>
                <Button variant="secondary" onClick={() => setNotFound(null)}>
                  📸 Scan Lagi
                </Button>
              </div>
            </Card>
          )}

          {result && (
            <ScanResult
              result={result}
              onScanAgain={() => {
                setResult(null);
                setNotFound(null);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Scan;
