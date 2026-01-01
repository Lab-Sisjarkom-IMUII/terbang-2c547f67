import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";

type User = { name: string; email: string; avatar: string };
type MonthlyReport = {
  id: string;
  year: number;
  month: number;
  month_start: string;
  total_sales: number;
  total_orders: number;
  total_items_sold: number;
};

const MonthlyReports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/monthly-reports")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching monthly reports:", err);
        setError(err.message || "Gagal memuat data laporan bulanan");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {user && <Navbar user={user} />}
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Ringkasan Bulanan</h1>

        <Card className="p-4">
          {loading ? (
            <p className="text-center">Memuat...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Bulan</th>
                    <th className="p-2">Total Pendapatan</th>
                    <th className="p-2">Total Pesanan</th>
                    <th className="p-2">Total Item Terjual</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-500">Tidak ada data</td>
                    </tr>
                  )}
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{new Date(r.month_start).toLocaleString(undefined, { month: "long", year: "numeric" })}</td>
                      <td className="p-2 font-semibold">Rp {Number(r.total_sales || 0).toLocaleString("id-ID")}</td>
                      <td className="p-2">{r.total_orders}</td>
                      <td className="p-2">{r.total_items_sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default MonthlyReports;
