import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { errorMessage } from '../../utils/apiClient';
import { authApi } from '../../utils/storeApi';

export function ProfileTab() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    phone_number: user?.phone_number ?? ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [pw, setPw] = useState({ old_password: '', new_password: '', new_password_confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      setUser(await authApi.updateProfile(profile));
      toast.success('Profile updated');
    } catch (err) {
      setProfileError(errorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.new_password !== pw.new_password_confirm) {
      setPwError('New passwords don’t match.');
      return;
    }
    setSavingPw(true);
    setPwError(null);
    try {
      const res = await authApi.changePassword(pw);
      toast.success(res.message || 'Password changed');
      setPw({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      setPwError(errorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="space-y-4 rounded-md bg-white p-6">
        <h3 className="text-lg font-semibold">Personal details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="p-first">First name</label><input id="p-first" className="field" required value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} /></div>
          <div><label className="label" htmlFor="p-last">Last name</label><input id="p-last" className="field" required value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} /></div>
        </div>
        <div><label className="label" htmlFor="p-email">Email</label><input id="p-email" className="field bg-canvas" value={user?.email ?? ''} readOnly /></div>
        <div><label className="label" htmlFor="p-phone">Phone</label><input id="p-phone" type="tel" className="field" value={profile.phone_number} onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })} /></div>
        {profileError && <p role="alert" className="text-sm text-danger">{profileError}</p>}
        <button type="submit" className="btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save changes'}</button>
      </form>

      <form onSubmit={savePassword} className="space-y-4 rounded-md bg-white p-6">
        <h3 className="text-lg font-semibold">Change password</h3>
        <div><label className="label" htmlFor="pw-old">Current password</label><input id="pw-old" type="password" className="field" required autoComplete="current-password" value={pw.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} /></div>
        <div><label className="label" htmlFor="pw-new">New password</label><input id="pw-new" type="password" className="field" required minLength={8} autoComplete="new-password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} /></div>
        <div><label className="label" htmlFor="pw-new2">Confirm new password</label><input id="pw-new2" type="password" className="field" required autoComplete="new-password" value={pw.new_password_confirm} onChange={(e) => setPw({ ...pw, new_password_confirm: e.target.value })} /></div>
        {pwError && <p role="alert" className="text-sm text-danger">{pwError}</p>}
        <button type="submit" className="btn-secondary" disabled={savingPw}>{savingPw ? 'Updating…' : 'Update password'}</button>
      </form>
    </div>);

}