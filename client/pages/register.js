import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import AuthForm from "../components/AuthForm";
import { authAPI } from "../lib/api";
import { setAuthToken, setUser, isAuthenticated } from "../lib/auth";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      router.push("/book");
    }
  }, [router]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register(formData);
      const { user, token } = response.data;

      // Store auth data
      setAuthToken(token);
      setUser(user);

      toast.success("Account created successfully!");
      router.push("/book");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <AuthForm
          type="register"
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
