import Cookies from "js-cookie";
import axiosInstance from "../axiosConfig";

const url_auth = "auth";

export const AuthService = {
  // 1. Método de Login (Vital para que funcione el resto)
  async login(credentials: any): Promise<any> {
    try {
      // El backend ahora espera @Post('login')
      const response = await axiosInstance.post(`${url_auth}/login`, credentials);

      if (response.data.accessToken) {
        // Guardamos el token en las cookies (expira en 1 día coincidiendo con el backend)
        Cookies.set("authTokens", response.data.accessToken, { expires: 1 });
      }

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: "Error de conexión" };
    }
  },

  // 2. Obtener información del usuario
  async getUserInfo(): Promise<any> {
    try {
      const token = Cookies.get("authTokens");

      if (!token) {
        // En lugar de lanzar error, redirigimos si estamos en el cliente
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
           window.location.href = "/login";
        }
        return null;
      }

      const response = await axiosInstance.get(`${url_auth}/get-me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(
        "Error al obtener información del usuario:",
        error.response?.data?.message || error.message
      );

      // Si el backend devuelve 401 (token inválido o expirado)
      if (error.response?.status === 401) {
        Cookies.remove("authTokens");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener perfil.",
        status: error.response?.status || 500,
      };
    }
  },

  // 3. Logout
  logout() {
    Cookies.remove("authTokens");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
};
