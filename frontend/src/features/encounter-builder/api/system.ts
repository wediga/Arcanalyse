import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import type { paths } from "@/shared/types/api";

type HealthOk  = paths["/api/v1/health"]["get"]["responses"]["200"]["content"]["application/json"];
type VersionOk = paths["/api/v1/version"]["get"]["responses"]["200"]["content"]["application/json"];

export function useHealthQuery() {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: () => apiFetch<HealthOk>("/api/v1/health"),
    staleTime: 30_000,
  });
}

export function useVersionQuery() {
  return useQuery({
    queryKey: ["system", "version"],
    queryFn: () => apiFetch<VersionOk>("/api/v1/version"),
    staleTime: 30_000,
  });
}
