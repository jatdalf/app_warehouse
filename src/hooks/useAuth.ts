
import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";

export type EmployeeProfile = {
  employee_id: string;
  full_name: string;
  area: string;
  role: string;
  active: boolean;
  must_change_password: boolean;
};

export const useAuth = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Identifica la consulta más reciente.
  const requestId = useRef(0);
  const authenticatedUserId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const loadProfile = async (
      userId: string | null,
      email: string | undefined,
      currentRequest: number
    ) => {
      if (!mounted || currentRequest !== requestId.current) {
        return;
      }

      if (!userId) {
        authenticatedUserId.current = null;
        setProfile(null);
        setAuthError("");
        setLoading(false);
        return;
      }

      // Evitar borrar el perfil durante una revalidación.
      setLoading(true);
      setAuthError("");

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("employee_id, full_name, area, role, active, must_change_password")
          .eq("id", userId)
          .single();

        if (!mounted || currentRequest !== requestId.current) {
          return;
        }

        // Un error de consulta no implica que el usuario sea inválido.
        if (error) {
          setAuthError(
            "No se pudo verificar tu perfil. Revisá la conexión e intentá nuevamente."
          );
          return;
        }

        // Verificamos que el perfil corresponda al usuario autenticado.
        const expectedEmail = `${data.employee_id}@opsflow.local`;

        if (
          !data.active ||
          !email ||
          email.toLowerCase() !== expectedEmail.toLowerCase()
        ) {
          setProfile(null);
          setAuthError("");
          await supabase.auth.signOut();
          return;
        }

        authenticatedUserId.current = userId;
        setProfile(data as EmployeeProfile);
        setAuthError("");
      } catch {
        if (mounted && currentRequest === requestId.current) {
          setAuthError(
            "Ocurrió un error al verificar la sesión."
          );
        }
      } finally {
        if (mounted && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED"
      ) {
        return;
      }

      const userId = session?.user.id ?? null;

      // Cierre de sesión: invalidamos cualquier consulta pendiente.
      if (event === "SIGNED_OUT") {
        ++requestId.current;
        authenticatedUserId.current = null;
        setProfile(null);
        setAuthError("");
        setLoading(false);
        return;
      }

      // Si Supabase confirma la sesión del mismo empleado,
      // no necesitamos volver a cargar su perfil.
      if (event === "SIGNED_IN" && userId && authenticatedUserId.current === userId) {
        return;
      }
      // Para una sesión nueva o un usuario diferente,
      // invalidamos las consultas anteriores.
      const currentRequest = ++requestId.current;
      // Ejecutamos las consultas fuera del callback de Auth.
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!mounted) return;
        void loadProfile(session?.user.id ?? null, session?.user.email, currentRequest);
      }, 0);
      timers.add(timer);
    });

    return () => {
      mounted = false;
      requestId.current++;
      timers.forEach(clearTimeout);
      timers.clear();
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  
const retry = async () => {
  const currentRequest = ++requestId.current;
  setLoading(true);
  setAuthError("");

  try {
    const { data, error } = await supabase.auth.getUser();
    if (currentRequest !== requestId.current) return;
    if (error || !data.user) {
      setAuthError("No se pudo verificar la sesión. Intentá nuevamente.");
      return;
    }

    const { data: employee, error: profileError } = await supabase
        .from("profiles")
        .select("employee_id, full_name, area, role, active, must_change_password")
        .eq("id", data.user.id)
        .single();

    if (currentRequest !== requestId.current) return;

    if (profileError || !employee) {
      setAuthError("No se pudo recuperar tu perfil. Intentá nuevamente.");
      return;
    }

    const expectedEmail = `${employee.employee_id}@opsflow.local`;

    if (!employee.active || !data.user.email ||
      data.user.email.toLowerCase() !== expectedEmail.toLowerCase()) {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setAuthError("No se pudo cerrar la sesión inválida.");
      }

      return;
    }

    setProfile(employee as EmployeeProfile);
  } catch {
    if (currentRequest === requestId.current) {
      setAuthError("No se pudo conectar con Supabase.");
    }
  } finally {
    if (currentRequest === requestId.current) {
      setLoading(false);
    }
  }
};

  return {
    profile,
    loading,
    authError,
    logout,
    retry,
  };
};