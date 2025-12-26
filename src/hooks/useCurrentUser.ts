import { useState, useEffect } from "react";
import { User } from "@/types/User";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try to load from localStorage first (fastest)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("info_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse user info", e);
        }
      }
    }

    // 2. Fetch from API to get latest data
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("info_user", JSON.stringify(data.user));
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}
    localStorage.removeItem("info_user");
    localStorage.removeItem("remember_login");
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
