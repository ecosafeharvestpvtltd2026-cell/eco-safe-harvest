import { createActor } from "@/backend";
import type { Role, Session } from "@/backend";
import { api } from "@/lib/api";
import { AUTH_ERROR_MESSAGES, GENERIC_ERROR_MESSAGE } from "@/lib/sinhala";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginError: string | null;
  isLoggingIn: boolean;
  login: (username: string, password: string, role: Role) => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async (): Promise<Session | null> => {
      if (!actor) return null;
      return api.getSession(actor);
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (input: {
      username: string;
      password: string;
      role: Role;
    }) => {
      if (!actor) throw new Error(GENERIC_ERROR_MESSAGE);
      const result = await api.login(
        actor,
        input.username,
        input.password,
        input.role,
      );
      if (result.__kind__ === "err") {
        throw new Error(
          AUTH_ERROR_MESSAGES[result.err] ?? GENERIC_ERROR_MESSAGE,
        );
      }
      return result.ok;
    },
    onSuccess: (session) => {
      setLoginError(null);
      queryClient.setQueryData(["session"], session);
      void queryClient.invalidateQueries();
    },
    onError: (error: unknown) => {
      setLoginError(
        error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE,
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await api.logout(actor);
    },
    onSuccess: () => {
      setLoginError(null);
      queryClient.setQueryData(["session"], null);
      void queryClient.invalidateQueries();
    },
  });

  const login = useCallback(
    (username: string, password: string, role: Role) => {
      setLoginError(null);
      loginMutation.mutate({ username, password, role });
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const session = sessionQuery.data ?? null;

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isLoading: sessionQuery.isLoading || isFetching,
      isAdmin: session?.role === "admin",
      loginError,
      isLoggingIn: loginMutation.isPending,
      login,
      logout,
    }),
    [
      session,
      sessionQuery.isLoading,
      isFetching,
      loginError,
      loginMutation.isPending,
      login,
      logout,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
