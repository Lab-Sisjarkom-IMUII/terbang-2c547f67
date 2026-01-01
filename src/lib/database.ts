export type DBUser = { email: string; name?: string; avatar?: string; password?: string };

export async function saveUserToDatabase(user: DBUser) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.ok;
}

export async function getUserFromDatabase(email: string): Promise<DBUser | null> {
  const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ?? null;
}

export async function addScanRecord(payload: {
  email: string;
  productName?: string;
  identifiedName: string;
  status?: string;
  confidence?: number;
  image?: string;
}) {
  await fetch("/api/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export type DBProduct = {
  id?: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image?: string;
  description?: string;
  salesTrend?: string;
};

export async function getProductsFromDatabase() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function addProductToDatabase(product: DBProduct) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to add product");
  }
  return res.json();
}

export async function updateProductInDatabase(product: DBProduct) {
  const res = await fetch("/api/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to update product");
  }
  return res.json();
}

export async function deleteProductFromDatabase(id: string) {
  const res = await fetch(`/api/products?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to delete product");
  }
  return res.json();
}
