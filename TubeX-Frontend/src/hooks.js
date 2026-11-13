import { useState } from "react";
import { getApiError } from "./api/client";

// This hook wraps any API function with the same loading/error behavior.
// Example: const { execute, loading, error } = useApi(loginUser);
export function useApi(request) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function execute(...args) {
    setLoading(true);
    setError("");

    try {
      const result = await request(...args);
      return result;
    } catch (err) {
      const message = getApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { execute, loading, error, setError };
}
