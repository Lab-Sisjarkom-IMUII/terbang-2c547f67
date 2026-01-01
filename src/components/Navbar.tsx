import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { toast } from "sonner";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logout berhasil!");
    navigate("/login");
  };

  return (
    <nav className="bg-card border-b border-primary/10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SmartVision
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate("/products")}>Produk</Button>
              <Button variant="ghost" onClick={() => navigate("/scan")}>Scan</Button>
              <Button variant="ghost" onClick={() => navigate("/report")}>Laporan</Button>
              <Button variant="ghost" onClick={() => navigate("/ai-chat")}>AI Chat</Button>
            </div>

            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-primary/10">
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              <div className="hidden lg:block text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex items-center gap-3 mb-4">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div className="text-sm">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                  <Button variant="outline" onClick={() => navigate("/products")}>Produk</Button>
                  <Button variant="outline" onClick={() => navigate("/scan")}>Scan</Button>
                  <Button variant="outline" onClick={() => navigate("/report")}>Laporan</Button>
                  <Button variant="outline" onClick={() => navigate("/ai-chat")}>AI Chat</Button>
                  <Button variant="default" onClick={handleLogout}>Logout</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

