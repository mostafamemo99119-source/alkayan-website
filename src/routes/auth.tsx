import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2, LockKeyhole, User } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "دخول الإدارة | الكيان" }, { name: "description", content: "بوابة إدارة محتوى الكيان." }, { property: "og:title", content: "دخول إدارة الكيان" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate({ from: "/auth" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); 
    setError("");
    const form = new FormData(event.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    setLoading(true);

    // Hardcoded Authentication
    if (username.trim() === "memo" && password === "01227084903") {
      localStorage.setItem("alkayan_admin_auth", "true");
      await navigate({ to: "/admin" });
    } else {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <div className="glass-card w-full max-w-md p-7 md:p-10">
        <Brand />
        <div className="my-8 border-y border-border py-7">
          <span className="flex size-12 items-center justify-center border border-gold-soft text-primary">
            <LockKeyhole className="size-5" />
          </span>
          <h1 className="mt-5 font-display text-3xl">دخول الإدارة</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">بوابة خاصة لإدارة المساحات والأسعار والصور.</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm">اسم المستخدم
            <div className="relative mt-2">
              <User className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <input name="username" type="text" dir="ltr" required autoComplete="username" className="admin-input pr-11" />
            </div>
          </label>
          <label className="block text-sm">كلمة المرور
            <div className="relative mt-2">
              <KeyRound className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <input name="password" type="password" required autoComplete="current-password" className="admin-input pr-11" />
            </div>
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full border-primary/50 text-primary bg-transparent hover:bg-primary/10 hover:border-primary border transition-all" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}دخول آمن
          </Button>
        </form>
      </div>
    </main>
  );
}
