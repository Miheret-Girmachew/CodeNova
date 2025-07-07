// src/pages/UserProfilePage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { Textarea } from "../components/ui/textarea.js";
import {
  UserCircle2 as UserIcon,
  Edit3,
  Save,
  KeyRound,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
  X,
  Briefcase,
  CalendarDays,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../lib/utils.js';

// This is a dummy API call simulation
const dummyUpdateProfile = async (data: any) => {
  console.log("Simulating API call to update profile with:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};
const dummyChangePassword = async (data: any) => {
    console.log("Simulating API call to change password.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
};


const UserProfilePage: React.FC = () => {
  const { currentUser: user, updateUserContextProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [bio, setBio] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const resetProfileFormFields = useCallback(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setCountry(user.country || '');
      // FIXED: Correctly access 'currentRole' which now exists on the AppUser type
      setCurrentRole(user.currentRole || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [authLoading, user, navigate, location]);

  useEffect(() => {
    if (user) {
      resetProfileFormFields();
      setPageLoading(false);
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading, resetProfileFormFields]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSavingProfile(true);

    await dummyUpdateProfile({ firstName, lastName, country, currentRole, bio });

    const profileDataToUpdate = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        country: country.trim(),
        currentRole: currentRole.trim(),
        bio: bio.trim(),
    };
    
    if (user) {
        updateUserContextProfile({ ...user, ...profileDataToUpdate });
    }

    setSuccessMessage('Profile updated successfully!');
    setIsEditingProfile(false);
    setIsSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    
    setIsSavingPassword(true);
    await dummyChangePassword({ newPassword });
    setIsSavingPassword(false);

    setSuccessMessage('Password changed successfully!');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsChangingPassword(false);
  };

  const clearMessages = () => { setError(null); setSuccessMessage(null); };
  const handleCancelEditProfile = () => { setIsEditingProfile(false); clearMessages(); resetProfileFormFields(); };
  const handleCancelChangePassword = () => { setIsChangingPassword(false); clearMessages(); setNewPassword(''); setConfirmNewPassword(''); setShowNewPassword(false); setShowConfirmNewPassword(false); };

  if (authLoading || pageLoading) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4"><Loader2 className="h-12 w-12 animate-spin text-sky-500" /><p className="text-slate-600 dark:text-slate-400 mt-4">Loading your profile...</p></div>;
  }

  if (!user) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4 text-center"><AlertCircle className="h-12 w-12 text-sky-500 mb-4" /><p className="text-slate-700 dark:text-slate-300">Could not load user profile.</p><Button onClick={() => navigate('/login', { replace: true })} className="mt-6 bg-sky-600 hover:bg-sky-700 text-white">Go to Login</Button></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <header className="mb-8 md:mb-12"><h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">My Profile</h1><p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account details and preferences.</p></header>
        {error && <div role="alert" className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center justify-between gap-4"><div className="flex items-center gap-3"> <AlertCircle className="h-5 w-5 shrink-0"/> <span>{error}</span> </div><Button variant="ghost" size="icon" className="h-7 w-7 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-700/50" onClick={clearMessages}> <X className="h-5 w-5" /> </Button></div>}
        {successMessage && <div role="alert" className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-4"><div className="flex items-center gap-3"> <CheckCircle className="h-5 w-5 shrink-0"/> <span>{successMessage}</span> </div><Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-700 hover:bg-emerald-200 dark:text-emerald-300 dark:hover:bg-emerald-700/50" onClick={clearMessages}> <X className="h-5 w-5" /> </Button></div>}
        <Card className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4"><UserIcon className="h-20 w-20 text-sky-500 flex-shrink-0" /><div><CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{user.displayName}</CardTitle><CardDescription className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400"><Mail className="h-4 w-4" />{user.email}</CardDescription></div></div>
            {!isEditingProfile && !isChangingPassword && <Button variant="outline" onClick={() => { setIsEditingProfile(true); clearMessages(); }}><Edit3 className="mr-2 h-4 w-4" />Edit Profile</Button>}
          </CardHeader>
          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={isSavingProfile} /></div>
                  <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={isSavingProfile} /></div>
                </div>
                <div><Label htmlFor="country">Country</Label><Input id="country" value={country} onChange={e => setCountry(e.target.value)} required disabled={isSavingProfile} /></div>
                <div><Label htmlFor="currentRole">Current Role (Optional)</Label><Input id="currentRole" value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="e.g., Student Developer" disabled={isSavingProfile} /></div>
                <div><Label htmlFor="bio">Bio (Optional)</Label><Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Passionate about building modern web applications..." disabled={isSavingProfile} /></div>
              </CardContent>
              <CardFooter className="p-6 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800"><Button type="button" variant="ghost" onClick={handleCancelEditProfile} disabled={isSavingProfile}>Cancel</Button><Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white" disabled={isSavingProfile}>{isSavingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><Save className="mr-2 h-4 w-4"/>Save Changes</>}</Button></CardFooter>
            </form>
          ) : (
            <CardContent className="p-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              <InfoItem icon={UserIcon} label="Full Name" value={user.displayName} />
              <InfoItem icon={MapPin} label="Country" value={user.country} />
              <InfoItem icon={Briefcase} label="Current Role" value={user.currentRole} />
              <InfoItem icon={CalendarDays} label="Joined On" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : undefined} />
              <div className="sm:col-span-2"><InfoItem icon={UserIcon} label="Bio" value={user.bio} isTextarea /></div>
            </CardContent>
          )}
        </Card>
        <Card className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800"><CardTitle className="text-xl font-bold flex items-center gap-3"><KeyRound className="h-5 w-5"/>Security</CardTitle>{!isChangingPassword && !isEditingProfile && <Button variant="outline" onClick={() => { setIsChangingPassword(true); clearMessages(); }}>Change Password</Button>}</CardHeader>
          {isChangingPassword && (<form onSubmit={handleChangePassword}><CardContent className="p-6 space-y-4"><div><Label htmlFor="newPassword">New Password</Label><div className="relative"><Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={isSavingPassword} className="pr-10" /><Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full" onClick={() => setShowNewPassword(s => !s)}>{showNewPassword ? <EyeOff/> : <Eye/>}</Button></div></div><div><Label htmlFor="confirmNewPassword">Confirm New Password</Label><div className="relative"><Input id="confirmNewPassword" type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required disabled={isSavingPassword} className="pr-10"/><Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full" onClick={() => setShowConfirmNewPassword(s => !s)}>{showConfirmNewPassword ? <EyeOff/> : <Eye/>}</Button></div></div></CardContent><CardFooter className="p-6 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800"><Button type="button" variant="ghost" onClick={handleCancelChangePassword} disabled={isSavingPassword}>Cancel</Button><Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white" disabled={isSavingPassword}>{isSavingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Updating...</> : <><Save className="mr-2 h-4 w-4"/>Update Password</>}</Button></CardFooter></form>)}
        </Card>
      </div>
    </div>
  );
};

// FIXED: Added a simple check to handle null or undefined values gracefully.
const InfoItem: React.FC<{icon: React.ElementType, label: string, value?: string | null, isTextarea?: boolean}> = ({ icon: Icon, label, value, isTextarea }) => (
    <div className={cn("flex flex-col gap-1", isTextarea && "sm:col-span-2")}>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Icon className="h-4 w-4"/>{label}</dt>
        <dd className="text-base text-slate-900 dark:text-white whitespace-pre-wrap">{value || 'Not specified'}</dd>
    </div>
);

export default UserProfilePage;