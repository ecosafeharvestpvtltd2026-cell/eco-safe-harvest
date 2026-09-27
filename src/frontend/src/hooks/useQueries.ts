import { createActor } from "@/backend";
import type {
  Dashboard,
  Farmer,
  FarmerDetail,
  Harvest,
  HarvestInput,
  HarvestSummary,
  PriceEntry,
  Product,
} from "@/backend";
import { api } from "@/lib/api";
import { todayDateText } from "@/lib/format";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Today's KPI totals plus the latest harvest entries for the dashboard. */
export function useDashboard() {
  const { actor, isFetching } = useActor(createActor);
  const today = todayDateText();
  return useQuery({
    queryKey: ["dashboard", today],
    queryFn: async (): Promise<Dashboard> => {
      if (!actor) throw new Error("Backend is not ready");
      return api.getDashboard(actor, today);
    },
    enabled: !!actor && !isFetching,
  });
}

/** All farmers, newest first as returned by the backend. */
export function useFarmers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["farmers"],
    queryFn: async (): Promise<Farmer[]> => {
      if (!actor) return [];
      return api.listFarmers(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Live farmer search across code, name, phone and village. */
export function useFarmerSearch(term: string) {
  const { actor, isFetching } = useActor(createActor);
  const trimmed = term.trim();
  return useQuery({
    queryKey: ["farmers", "search", trimmed],
    queryFn: async (): Promise<Farmer[]> => {
      if (!actor) return [];
      return api.searchFarmers(actor, trimmed);
    },
    enabled: !!actor && !isFetching && trimmed.length > 0,
  });
}

/** One farmer with that farmer's harvest history. */
export function useFarmer(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["farmer", id?.toString() ?? "none"],
    queryFn: async (): Promise<FarmerDetail | null> => {
      if (!actor || id === null) return null;
      return api.getFarmer(actor, id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** Harvest history for one farmer. */
export function useFarmerHarvests(farmerId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["farmer-harvests", farmerId?.toString() ?? "none"],
    queryFn: async (): Promise<HarvestSummary[]> => {
      if (!actor || farmerId === null) return [];
      return api.getFarmerHarvests(actor, farmerId);
    },
    enabled: !!actor && !isFetching && farmerId !== null,
  });
}

/** Add a farmer (admin only). */
export function useAddFarmer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      code: string;
      name: string;
      phone: string;
      village: string;
      address: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.addFarmer(
        actor,
        input.code,
        input.name,
        input.phone,
        input.village,
        input.address,
        input.notes,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["farmers"] });
    },
  });
}

/** Edit a farmer's details (admin only). */
export function useUpdateFarmer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      code: string;
      name: string;
      phone: string;
      village: string;
      address: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.updateFarmer(
        actor,
        input.id,
        input.code,
        input.name,
        input.phone,
        input.village,
        input.address,
        input.notes,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["farmers"] });
      void queryClient.invalidateQueries({ queryKey: ["farmer"] });
    },
  });
}

/** All harvest records visible to the signed-in role. */
export function useHarvests() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["harvests"],
    queryFn: async (): Promise<Harvest[]> => {
      if (!actor) return [];
      return api.listHarvests(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Enter a harvest record; the price used is frozen into the record. */
export function useAddHarvest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: HarvestInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.addHarvest(actor, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["farmer-harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Edit a harvest record (admin only). */
export function useUpdateHarvest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: bigint; input: HarvestInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.updateHarvest(actor, input.id, input.input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["farmer-harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Delete a harvest record (admin only). */
export function useDeleteHarvest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.deleteHarvest(actor, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["farmer-harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** The current price list for all seven products. */
export function usePrices() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["prices"],
    queryFn: async (): Promise<PriceEntry[]> => {
      if (!actor) return [];
      return api.listPrices(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Update the current price per kg for one product (admin only). */
export function useSetPrice() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { product: Product; pricePerKg: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.setPrice(actor, input.product, input.pricePerKg);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["prices"] });
    },
  });
}
