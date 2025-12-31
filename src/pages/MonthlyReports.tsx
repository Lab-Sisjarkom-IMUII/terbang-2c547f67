import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";

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
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/monthly-reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar user={{ name: "Admin", email: "admin@example.com", avatar: "/favicon.ico" }} />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Ringkasan Bulanan</h1>

        <Card className="p-4">
          {loading ? (
            <p>Memuat...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Bulan</th>
                    <th className="p-2">Total Pendapatan</th>
                    <th className="p-2">Total Pesanan</th>
                    <th className="p-2">Total Item Terjual</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-2">Tidak ada data</td>
                    </tr>
                  )}
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{new Date(r.month_start).toLocaleString(undefined, { month: "long", year: "numeric" })}</td>
                      <td className="p-2">Rp {Number(r.total_sales).toLocaleString()}</td>
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
