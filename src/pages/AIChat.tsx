import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const AIChat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: "ai",
      text: "Halo! 👋 Saya AI Assistant SmartVision. Tanyakan apa saja tentang stok produk Anda, misalnya: 'Gimana toko hari ini?' atau 'Produk mana yang stoknya rendah?'",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const generateInsight = (question: string): string => {
    const productsData = localStorage.getItem("products");
    const products = productsData ? JSON.parse(productsData) : [];
    
    const totalProducts = products.length;
    const lowStock = products.filter((p: any) => p.stock < 10);
    const outOfStock = products.filter((p: any) => p.stock === 0);
    const totalValue = products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0);
    const avgStock = products.length > 0 
      ? products.reduce((sum: number, p: any) => sum + p.stock, 0) / products.length 
      : 0;

    const lowerQ = question.toLowerCase();

    // Pattern matching untuk berbagai jenis pertanyaan
    if (lowerQ.includes("hari ini") || lowerQ.includes("kondisi toko") || lowerQ.includes("gimana toko")) {
      if (lowStock.length > 0) {
        return `Hari ini toko punya ${totalProducts} produk dengan total nilai stok Rp ${totalValue.toLocaleString('id-ID')}. Perlu perhatian: ada ${lowStock.length} produk dengan stok rendah (< 10). Sisanya stabil! 📊`;
      }
      return `Kondisi toko hari ini bagus! Total ${totalProducts} produk tersedia dengan stok yang cukup. Total nilai stok sekitar Rp ${totalValue.toLocaleString('id-ID')}. Semua terkendali! ✨`;
    }

    if (lowerQ.includes("stok rendah") || lowerQ.includes("stok kurang") || lowerQ.includes("stok berkurang") || lowerQ.includes("stok menipis")) {
      if (lowStock.length === 0) {
        return `Kabar baik! Semua produk masih punya stok yang cukup. Tidak ada yang perlu direstock segera. 👍`;
      }
      const names = lowStock.slice(0, 3).map((p: any) => `${p.name} (${p.stock} unit)`).join(", ");
      return `Ada ${lowStock.length} produk dengan stok rendah: ${names}${lowStock.length > 3 ? ", dan lainnya" : ""}. Pertimbangkan untuk restock ya! 📦`;
    }

    if (lowerQ.includes("habis") || lowerQ.includes("kosong") || lowerQ.includes("out of stock")) {
      if (outOfStock.length === 0) {
        return `Bagus! Tidak ada produk yang habis stoknya. Semua masih tersedia untuk dijual. 🎉`;
      }
      const names = outOfStock.slice(0, 3).map((p: any) => p.name).join(", ");
      return `Ada ${outOfStock.length} produk yang habis: ${names}${outOfStock.length > 3 ? ", dan lainnya" : ""}. Segera restock untuk menghindari kehilangan penjualan! ⚠️`;
    }

    if (lowerQ.includes("paling") && (lowerQ.includes("banyak") || lowerQ.includes("tinggi"))) {
      const sorted = [...products].sort((a: any, b: any) => b.stock - a.stock);
      const top = sorted.slice(0, 3);
      const names = top.map((p: any) => `${p.name} (${p.stock} unit)`).join(", ");
      return `Produk dengan stok terbanyak: ${names}. Stok melimpah untuk produk-produk ini! 📈`;
    }

    if (lowerQ.includes("nilai") || lowerQ.includes("total") || lowerQ.includes("harga")) {
      const topValue = [...products]
        .map((p: any) => ({ ...p, value: p.price * p.stock }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 3);
      const names = topValue.map((p: any) => `${p.name} (Rp ${p.value.toLocaleString('id-ID')})`).join(", ");
      return `Total nilai inventori: Rp ${totalValue.toLocaleString('id-ID')}. Produk dengan nilai tertinggi: ${names}. 💰`;
    }

    if (lowerQ.includes("kategori") || lowerQ.includes("jenis")) {
      const categories = [...new Set(products.map((p: any) => p.category))];
      return `Toko punya ${categories.length} kategori produk: ${categories.join(", ")}. Total ${totalProducts} produk tersebar di berbagai kategori. 🏷️`;
    }

    if (lowerQ.includes("rata-rata") || lowerQ.includes("average")) {
      return `Rata-rata stok per produk: ${avgStock.toFixed(1)} unit. Total produk: ${totalProducts}. Distribusi stok ${avgStock > 20 ? "cukup baik" : "perlu perhatian"}. 📊`;
    }

    // Default response
    return `Saya analisis ${totalProducts} produk Anda. ${lowStock.length > 0 ? `Ada ${lowStock.length} produk stok rendah. ` : ""}Stok rata-rata ${avgStock.toFixed(0)} unit per produk. Tanyakan lebih spesifik untuk insight detail! 🤖`;
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: question,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: Message = {
        role: "ai",
        text: generateInsight(question),
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Insight Chat</h1>
                <p className="text-muted-foreground">Tanyakan apa saja tentang stok dan kondisi toko Anda</p>
              </div>
            </div>
          </div>

          <Card className="flex flex-col h-[calc(100vh-280px)] bg-card border-border">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI sedang berpikir...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tanyakan kondisi toko, stok rendah, produk terlaris..."
                  className="flex-1 bg-background border-input"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !question.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Gimana toko hari ini?", "Produk mana yang stoknya rendah?", "Produk apa yang habis?"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion(suggestion)}
                    disabled={loading}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

