import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image: string;
  salesTrend: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  
  const getStatusColor = () => {
    if (product.stock === 0) return "bg-status-danger/20 text-status-danger";
    if (product.stock <= 10) return "bg-status-warning/20 text-status-warning";
    return "bg-status-safe/20 text-status-safe";
  };

  const getStatusText = () => {
    if (product.stock === 0) return "Habis";
    if (product.stock <= 10) return "Menipis";
    return "Aman";
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-elegant transition-all border-primary/10 hover:border-primary/30"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square overflow-hidden bg-accent/50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className="text-sm font-medium">Stok: {product.stock}</span>
        </div>

        <div className="pt-2 border-t border-primary/10">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Harga</span>
            <span className="font-bold text-primary">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">Tren</span>
            <span className="text-xs font-medium text-status-safe">
              {product.salesTrend}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;

