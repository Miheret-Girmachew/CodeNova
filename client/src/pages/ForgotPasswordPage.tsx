// src/pages/ForgotPasswordPage.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { ArrowLeft, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import codeNovaLogo from "../assets/codenova-logo.svg";

// The logic using the Firebase Client SDK is preserved.
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app as firebaseClientApp } from "../config/firebaseClient.config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // This core logic remains unchanged. It's already perfect.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const authClient = getAuth(firebaseClientApp);
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    };

    try {
      await sendPasswordResetEmail(authClient, email, actionCodeSettings);
      setMessage("If an account with that email exists, a password reset link has been sent. Please check your inbox and spam folder.");
    } catch (err: any) {
      // For security, always show a generic success message even on errors like "user-not-found".
      setMessage("If an account with that email exists, a password reset link has been sent. Please check your inbox and spam folder.");
      console.error("Firebase password reset error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const renderFeedback = () => {
    if (message) {
      return (
        <div className="flex items-start text-sm text-emerald-600 dark:text-emerald-400 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
          <ShieldCheck className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-start text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <ShieldAlert className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      );
    }
    return null;
  };

  return (
    // Re-skinned with the CodeNova theme
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/">
            <img src={codeNovaLogo} alt="CodeNova Logo" className="h-12 w-auto mx-auto" />
          </Link>
        </div>

        <Card className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Enter your email and we'll send you a link to reset it.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {message ? null : ( // Hide the form after success
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="pt-1 min-h-[60px]"> {/* Reserve space for feedback */}
                {renderFeedback()}
              </div>
            </CardContent>
            
            {!message && ( // Hide the submit button after success
              <CardFooter>
                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </CardFooter>
            )}
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}