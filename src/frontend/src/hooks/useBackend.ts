import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/** The generated backend actor, or null while the agent is still connecting. */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching, isReady: !!actor && !isFetching };
}
