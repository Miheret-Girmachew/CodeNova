// src/pages/LoginPage.tsx

import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import codeNovaLogo from  "../assets/logo.png";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (loading) return;

    // THIS CORE LOGIC IS PRESERVED AND UNCHANGED
    try {
      const loggedInUser = await login(formData.email, formData.password);
      if (loggedInUser?.role === 'admin') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      const message = error?.message || "Invalid email or password. Please check your credentials.";
      setFormError(message);
    }
  };

  return (
    // 1. Updated background and layout styling
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/">
            <img src={codeNovaLogo} alt="CodeNova Logo" className="h-12 w-auto mx-auto" />
          </Link>
        </div>

        {/* 2. Updated Card styling with modern theme */}
        <Card className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 shadow-md relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <CardHeader className="text-center pt-12">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Log In to Your Account
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Welcome back to CodeNova!
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-800 dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-800 dark:text-slate-300">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {formError && (
                <p className="text-sm text-red-500 dark:text-red-400 text-center pt-1">{formError}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}