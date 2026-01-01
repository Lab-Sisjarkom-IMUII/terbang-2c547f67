import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { mockProducts } from "@/lib/mockData";
import { getProductsFromDatabase, addProductToDatabase, updateProductInDatabase, deleteProductFromDatabase, DBProduct } from "@/lib/database";

type User = { name: string; email: string; avatar: string };
type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image: string;
  description?: string;
  salesTrend?: string;
};

const Products = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [catDraft, setCatDraft] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: 0,
    price: 0,
    image: "",
    description: ""
  });

  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // Load products from Database via API
    const loadProducts = async () => {
      try {
        const productsData = await getProductsFromDatabase();
        if (productsData && Array.isArray(productsData)) {
          // Map DBProduct to Product (ensure required fields)
          const mappedProducts: Product[] = productsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            stock: p.stock,
            price: p.price,
            image: p.image || "",
            description: p.description,
            salesTrend: p.salesTrend
          }));
          setProducts(mappedProducts);
          // Sync to localStorage as cache
          localStorage.setItem("products", JSON.stringify(mappedProducts));
        }
      } catch (err) {
        console.error('Error loading products:', err);
        // Fallback to localStorage
        const savedProducts = localStorage.getItem("products");
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        } else {
          setProducts(mockProducts);
          localStorage.setItem("products", JSON.stringify(mockProducts));
        }
        toast.error("Gagal memuat produk dari database, menggunakan data lokal");
      }
    };

    loadProducts();

    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      const savedProducts = localStorage.getItem("products");
      const base = Array.from(new Set((savedProducts ? JSON.parse(savedProducts) : mockProducts).map((p: Product) => p.category)));
      const defaults = ["Minuman", "Makanan", "Snack", "Cokelat"];
      const merged = Array.from(new Set([...base, ...defaults]));
      setCategories(merged as string[]);
      localStorage.setItem("categories", JSON.stringify(merged));
    }

    const params = new URLSearchParams(location.search);
    const addName = params.get("add");
    if (addName) {
      setFormData((prev) => ({ ...prev, name: addName }));
      setIsOpen(true);
    }
  }, [navigate, location.search]);

  const generateDescription = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Masukkan nama dan kategori produk terlebih dahulu");
      return;
    }

    setGenerating(true);

    // Mock AI Description Generator
    setTimeout(() => {
      const descriptions = [
        `${formData.name} adalah produk ${formData.category.toLowerCase()} berkualitas tinggi yang sempurna untuk konsumsi sehari-hari. Dikemas dengan bahan premium dan standar kualitas terjamin.`,
        `Nikmati kesegaran ${formData.name} dari kategori ${formData.category}. Produk ini sangat populer dan menjadi pilihan favorit pelanggan kami.`,
        `${formData.name} hadir dengan kualitas terbaik di kelasnya. Sebagai bagian dari kategori ${formData.category}, produk ini memberikan nilai maksimal untuk kebutuhan Anda.`
      ];

      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      setFormData(prev => ({ ...prev, description: randomDescription }));
      setGenerating(false);
      toast.success("Deskripsi AI berhasil dibuat!");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // Update existing product in Database
        const updatedProduct: DBProduct = {
          id: editingProduct.id,
          name: formData.name,
          category: formData.category,
          stock: formData.stock,
          price: formData.price,
          image: formData.image,
          description: formData.description,
          salesTrend: editingProduct.salesTrend
        };

        const result = await updateProductInDatabase(updatedProduct);

        if (!result) {
           throw new Error("Gagal update produk");
        }

        // Update local state
        const updated = products.map(p =>
          p.id === editingProduct.id ? { ...p, ...updatedProduct } as Product : p
        );
        setProducts(updated);
        localStorage.setItem("products", JSON.stringify(updated));
        toast.success("Produk berhasil diupdate!");
      } else {
        // Insert new product to Database
        const newProduct: DBProduct = {
          name: formData.name,
          category: formData.category,
          stock: formData.stock,
          price: formData.price,
          image: formData.image,
          description: formData.description,
          salesTrend: "+0%"
        };

        const result = await addProductToDatabase(newProduct);

        if (!result) {
           throw new Error("Gagal menambah produk");
        }

        // Update local state with the new product (including the ID from database)
        const insertedProduct: Product = {
            id: result.id,
            name: result.name,
            category: result.category,
            stock: result.stock,
            price: result.price,
            image: result.image || "",
            description: result.description,
            salesTrend: result.salesTrend
        };

        const updated = [insertedProduct, ...products];
        setProducts(updated);
        localStorage.setItem("products", JSON.stringify(updated));
        toast.success("Produk berhasil ditambahkan!");
      }

      resetForm();
    } catch (err) {
      console.error('Error:', err);
      toast.error("Terjadi kesalahan saat menyimpan produk");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      image: product.image,
      description: product.description || ""
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete from Database
      await deleteProductFromDatabase(id);

      // Update local state
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
      toast.success("Produk berhasil dihapus!");
    } catch (err) {
      console.error('Error:', err);
      toast.error("Terjadi kesalahan saat menghapus produk");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      stock: 0,
      price: 0,
      image: "",
      description: ""
    });
    setEditingProduct(null);
    setIsOpen(false);
  };

  const openCategoryManager = () => {
    setCatDraft(categories);
    setNewCategory("");
    setIsCatOpen(true);
  };

  const saveCategories = () => {
    const cleaned = catDraft.map((c) => c.trim()).filter((c) => c.length > 0);
    const unique = Array.from(new Set(cleaned));
    setCategories(unique);
    localStorage.setItem("categories", JSON.stringify(unique));
    if (unique.length > 0 && !unique.includes(formData.category)) {
      setFormData((prev) => ({ ...prev, category: "" }));
    }
    setIsCatOpen(false);
    toast.success("Jenis barang berhasil disimpan");
  };

  const addCategory = () => {
    const v = newCategory.trim();
    if (!v) return;
    if (catDraft.includes(v)) {
      toast.info("Jenis sudah ada");
      return;
    }
    setCatDraft((prev) => [...prev, v]);
    setNewCategory("");
  };

  const removeCategory = (idx: number) => {
    setCatDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCategory = (idx: number, value: string) => {
    setCatDraft((prev) => prev.map((c, i) => (i === idx ? value : c)));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kelola Produk</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary" onClick={() => resetForm()}>
                ➕ Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category">Kategori</Label>
                      <Button type="button" variant="outline" size="sm" onClick={openCategoryManager}>
                        Kelola Jenis
                      </Button>
                    </div>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">URL Gambar</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="description">Deskripsi Produk</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateDescription}
                      disabled={generating}
                      className="text-xs"
                    >
                      {generating ? "🤖 Generating..." : "🤖 Generate dengan AI"}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi akan dibuat otomatis oleh AI..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-primary flex-1">
                    {editingProduct ? "Update Produk" : "Simpan Produk"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Kelola Jenis Barang</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                {catDraft.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada jenis. Tambahkan di bawah.</p>
                )}
                {catDraft.map((c, idx) => (
                  <div key={`${c}-${idx}`} className="flex items-center gap-2">
                    <Input value={c} onChange={(e) => updateCategory(idx, e.target.value)} />
                    <Button type="button" variant="destructive" onClick={() => removeCategory(idx)}>Hapus</Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Jenis baru" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <Button type="button" variant="secondary" onClick={addCategory}>Tambah</Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" className="bg-gradient-primary flex-1" onClick={saveCategories}>Simpan</Button>
                <Button type="button" variant="outline" onClick={() => setIsCatOpen(false)}>Tutup</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={{ ...product, salesTrend: product.salesTrend || "+0%" }} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(product)}
                  className="h-8 w-8 p-0"
                >
                  ✏️
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(product.id)}
                  className="h-8 w-8 p-0"
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;
