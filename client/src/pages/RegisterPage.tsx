// src/pages/RegisterPage.tsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import apiClient from "../services/apiClient";
import codeNovaLogo from "../assets/logo.png";

interface ProgramPlan {
  id: string;
  name: string;
}

const allCountries: string[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
].sort();

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    currentRole: "",
    selectedPlanId: "",
    agreeTerms: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<ProgramPlan[]>([]);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setAvailablePlans([
      { id: "codenova-fullstack-2024", name: "CodeNova Full-Stack Program" },
      { id: "codenova-frontend-2024", name: "Frontend Focus Program (Coming Soon)" },
    ]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({...prev, agreeTerms: checked}));
    setFormError(null);
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.agreeTerms) {
      setFormError("You must agree to the terms of service to continue.");
      return;
    }
    
    setLoading(true);
    try {
        const registrationPayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            country: formData.country,
            currentRole: formData.currentRole,
            selectedCohortId: formData.selectedPlanId,
        };
        
        const response = await apiClient.post('/payments/initialize-registration', registrationPayload);
        
        if (response.data?.checkout_url) {
            window.location.href = response.data.checkout_url;
        } else {
            throw new Error("Failed to retrieve payment URL from server.");
        }

    } catch (error: any) {
      setFormError(error.response?.data?.message || "Registration failed. Please check your details and try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setFormError(null);
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setFormError("Please fill all required account fields.");
        return;
      }
      if (formData.password.length < 6) {
        setFormError("Password must be at least 6 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.country || !formData.selectedPlanId) {
        setFormError("Please select your country and program plan.");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setFormError(null);
    setStep(s => s - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="mx-auto w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/">
            <img src={codeNovaLogo} alt="CodeNova Logo" className="h-12 w-auto mx-auto" />
          </Link>
        </div>
        <Card className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Join CodeNova</CardTitle>
                <CardDescription className="text-center text-slate-600 dark:text-slate-400">
                  Step {step} of 3: {step === 1 ? 'Account Details' : step === 2 ? 'Your Profile' : 'Confirmation & Payment'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleFinalSubmit}>
                {step === 1 && (
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
                            <div className="space-y-1"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
                        </div>
                        <div className="space-y-1"><Label htmlFor="email">Email Address</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
                        <div className="space-y-1">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required className="pr-10" />
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full w-10 text-slate-500 hover:text-slate-800" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</Button>
                          </div>
                          <p className="text-xs text-slate-500">Minimum 6 characters.</p>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} required className="pr-10" />
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full w-10 text-slate-500 hover:text-slate-800" onClick={() => setShowConfirmPassword(s => !s)} aria-label="Toggle confirm password visibility">{showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</Button>
                          </div>
                        </div>
                    </CardContent>
                )}
                 {step === 2 && (
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="country">Country</Label>
                            <Select name="country" value={formData.country} onValueChange={(value) => handleSelectChange('country', value)}>
                                <SelectTrigger><SelectValue placeholder="Select your country..." /></SelectTrigger>
                                <SelectContent>
                                  {allCountries.map((countryName) => (
                                    <SelectItem key={countryName} value={countryName}>{countryName}</SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1"><Label htmlFor="currentRole">Current Role (Optional)</Label><Input id="currentRole" name="currentRole" value={formData.currentRole} onChange={handleChange} placeholder="e.g., Student, Frontend Developer" /></div>
                        <div className="space-y-1"><Label htmlFor="selectedPlanId">Select Program</Label>
                            <Select name="selectedPlanId" value={formData.selectedPlanId} onValueChange={(value) => handleSelectChange('selectedPlanId', value)}>
                                <SelectTrigger><SelectValue placeholder="Choose your program..." /></SelectTrigger>
                                <SelectContent>{availablePlans.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                )}
                 {step === 3 && (
                    <CardContent className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Confirm Your Details</h3>
                        <div className="text-sm space-y-2 rounded-md border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                            <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                            <p><strong>Email:</strong> {formData.email}</p>
                            <p><strong>Country:</strong> {formData.country}</p>
                            <p><strong>Program:</strong> {availablePlans.find(p => p.id === formData.selectedPlanId)?.name}</p>
                        </div>
                        <div className="flex items-start space-x-3 pt-2">
                          <Checkbox id="agreeTerms" checked={formData.agreeTerms} onCheckedChange={(c: boolean | "indeterminate") => handleCheckboxChange(c === true)} required />
                          <Label htmlFor="agreeTerms" className="text-sm font-normal text-slate-600 dark:text-slate-400">I agree to the <Link to="/terms" target="_blank" className="underline hover:text-sky-500">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="underline hover:text-sky-500">Privacy Policy</Link>.</Label>
                        </div>
                    </CardContent>
                )}
                <CardFooter className="flex justify-between items-center pt-6">
                    <div>{step > 1 && <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>}</div>
                    <div>
                        {step < 3 && <Button type="button" onClick={nextStep}>Next</Button>}
                        {step === 3 && <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white" disabled={loading}>{loading && <Loader2 className="animate-spin mr-2"/>}Proceed to Payment</Button>}
                    </div>
                </CardFooter>
                 {formError && <p className="text-sm text-center text-red-500 dark:text-red-400 pb-4">{formError}</p>}
            </form>
        </Card>
      </div>
    </div>
  );
}