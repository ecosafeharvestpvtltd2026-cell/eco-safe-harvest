import { SessionContext } from "@/context/SessionContext";
import type { SessionContextValue } from "@/context/SessionContext";
import { useContext } from "react";

/** Access the signed-in session, role and auth actions. */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
