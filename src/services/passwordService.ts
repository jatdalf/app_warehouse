
import { supabase } from "./supabaseClient";

type ChangePasswordResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export const completePasswordChange = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  if (!currentPassword) {
    throw new Error("Ingresá tu contraseña actual.");
  }

  if (newPassword.length < 8 || newPassword.length > 16) {
    throw new Error(
      "La nueva contraseña debe tener entre 8 y 16 caracteres."
    );
  }

  if (currentPassword === newPassword) {
    throw new Error(
      "La nueva contraseña debe ser diferente de la actual."
    );
  }

  const { data, error } =
    await supabase.functions.invoke<ChangePasswordResponse>(
      "complete-password-change",
      {
        body: {
          currentPassword,
          newPassword,
        },
      }
    );

  if (error || !data?.success) {
    throw new Error(
      data?.error ||
        error?.message ||
        "No se pudo completar el cambio de contraseña."
    );
  }
};
