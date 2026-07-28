"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * Redirects to /login when there's no authenticated user. Returns `true`
 * once the check has passed, so callers can gate rendering (`if (!ready)
 * return null;`) and avoid a flash of protected content before the
 * redirect happens.
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [user, hasHydrated, router]);

  return ready;
}
