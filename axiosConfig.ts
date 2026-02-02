import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { toastError, toastSuccess } from "./common/feedback/toast-standalone";

// 1. URL BASE: Aseguramos que use la variable de Vercel y limpiamos posibles barras
const rawBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const baseURL = rawBaseURL.endsWith("/") ? rawBaseURL.slice(0, -1) : rawBaseURL;

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function getToken() {
  return getCookie("authTokens");
}

declare module "axios" {
  export interface AxiosRequestConfig {
    meta?: {
      successMessage?: string;
      errorMessage?: string;
      silent?: boolean;
    };
  }
}

function extractErrorMessage(error: unknown): string {
  const err = error as AxiosError<any>;
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    if (data?.title && data?.detail) return `${data.title}: ${data.detail}`;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (Array.isArray(data?.errors)) {
      return data.errors.map((e: any) => e?.message ?? e).join(", ");
    }
  }
  if (err?.message) return err.message;
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

function shouldAutoSuccessToast(config?: AxiosRequestConfig) {
  const method = (config?.method ?? "get").toLowerCase();
  return method !== "get";
}

function defaultSuccessMessage(method?: string) {
  switch ((method ?? "get").toLowerCase()) {
    case "post": return "Creado correctamente";
    case "put":
    case "patch": return "Actualizado correctamente";
    case "delete": return "Eliminado correctamente";
    default: return "Operación realizada";
  }
}

// 2. CREACIÓN DE INSTANCIA
const axiosInstance = axios.create({
  baseURL: baseURL, // Usamos la URL limpia
  timeout: 15000,    // Aumentamos un poco por si el Cold Start de Vercel es lento
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // LOG DE SEGURIDAD (Solo para desarrollo):
    // console.log("Petición a:", config.baseURL + "/" + config.url);

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { config } = response;
    if (!config?.meta?.silent && shouldAutoSuccessToast(config)) {
      const msg = config.meta?.successMessage ?? defaultSuccessMessage(config.method);
      if (msg) toastSuccess({ title: msg });
    }
    return response;
  },
  (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig | undefined;

    // Manejo automático de redirección al login si el token expira (401)
    if (error.response?.status === 401 && typeof window !== "undefined") {
      document.cookie = "authTokens=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (!config?.meta?.silent) {
      const fallback = config?.meta?.errorMessage;
      const message = fallback ?? extractErrorMessage(error);
      toastError({ title: "Error", description: message });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
