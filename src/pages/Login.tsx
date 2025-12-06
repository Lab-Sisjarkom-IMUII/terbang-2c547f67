import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // NOTE: Removed automatic redirect here so the login page is shown
  // on first open even if a `user` entry exists in localStorage.

  // Tambahkan tipe global untuk window.google
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getGoogle = (): any | undefined => (window as any).google;

  const handleGoogleLogin = () => {
    setIsLoading(true);
    try {
      const google = getGoogle();
      if (!google) {
        toast.error("Google Sign-In belum siap. Coba lagi sebentar.");
        setIsLoading(false);
        return;
      }
      if (!clientId) {
        toast.error("Client ID Google belum dikonfigurasi di .env");
        setIsLoading(false);
        return;
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid profile email",
        prompt: "consent",
        callback: async (tokenResponse: { access_token: string }) => {
          try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            if (!res.ok) throw new Error("Gagal mengambil profil pengguna");
            const profile = await res.json();
            const user = {
              name: profile.name,
              email: profile.email,
              avatar: profile.picture,
            };
            localStorage.setItem("user", JSON.stringify(user));
            toast.success("Login berhasil!");
            navigate("/dashboard");
          } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat login Google");
          } finally {
            setIsLoading(false);
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      console.error(err);
      toast.error("Tidak dapat memulai proses login");
      setIsLoading(false);
    }
  };

  const handleManualSubmit = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Email dan password wajib diisi");
      return;
    }
    const emailValid = /.+@.+\..+/.test(trimmedEmail);
    if (!emailValid) {
      toast.error("Format email tidak valid");
      return;
    }
    if (trimmedPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      const usersRaw = localStorage.getItem("users");
      const users: { email: string; password: string; name?: string }[] = usersRaw ? JSON.parse(usersRaw) : [];

      if (isRegister) {
        const exists = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
        if (exists) {
          toast.error("Email sudah terdaftar");
          return;
        }
        const name = trimmedEmail.split("@")[0];
        const newUser = { email: trimmedEmail, password: trimmedPassword, name };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("user", JSON.stringify({ name, email: trimmedEmail }));
        toast.success("Registrasi berhasil!");
        navigate("/dashboard");
      } else {
        const found = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
        if (!found) {
          toast.error("Akun tidak ditemukan");
          return;
        }
        if (found.password !== trimmedPassword) {
          toast.error("Password salah");
          return;
        }
        localStorage.setItem("user", JSON.stringify({ name: found.name || trimmedEmail.split("@")[0], email: trimmedEmail }));
        toast.success("Login berhasil!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan otentikasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] safe-area overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
      {/* Dekorasi background berbentuk gradient blur */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-primary opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background:radial-gradient(ellipse_at_top_left,rgba(99,102,241,.35),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,.35),transparent_40%)]" />

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16 relative">
        <div className="grid gap-10 items-center justify-center">
          <Card className="w-full max-w-md justify-self-center p-8 space-y-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-elegant">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Masuk ke Akun Anda</h2>
              <p className="text-sm text-muted-foreground">Login manual atau gunakan akun Google</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={isRegister ? "outline" : "default"}
                  onClick={() => setIsRegister(false)}
                  className={!isRegister ? "bg-gradient-primary" : ""}
                >
                  Login Manual
                </Button>
                <Button
                  variant={isRegister ? "default" : "outline"}
                  onClick={() => setIsRegister(true)}
                  className={isRegister ? "bg-gradient-primary" : ""}
                >
                  Daftar Manual
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Karyawan</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleManualSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary"
                >
                  {isRegister ? (isSubmitting ? "Mendaftar..." : "Daftar") : (isSubmitting ? "Masuk..." : "Masuk")}
                </Button>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">atau</span>
              </div>
            </div>

            <Button
              aria-label="Login dengan Google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 gap-3 shadow-sm hover:shadow-md transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? "Memproses..." : "Login dengan Google"}
            </Button>

            <div className="text-xs text-center text-muted-foreground">
              <p>Kami hanya mengambil nama, email, dan foto profil Anda.</p>
            </div>
          </Card>
          </div>
      </div>
    </div>
  );
};

export default Login;
