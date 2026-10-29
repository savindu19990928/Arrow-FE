import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage, getFieldErrors } from '../../utils/apiClient';
import { formatDate } from '../../utils/format';
import { authApi } from '../../utils/shopApi';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

export function ProfileTab() {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [phone, setPhone] = useState(user?.phone_number ?? '');
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [changing, setChanging] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({ first_name: firstName, last_name: lastName, phone_number: phone });
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwErrors({ new_password_confirm: 'Passwords do not match' });
      return;
    }
    setChanging(true);
    setPwErrors({});
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword
      });
      toast.success('Password changed');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="grid gap-12 xl:grid-cols-2">
      <form onSubmit={saveProfile} className="space-y-4">
        <h3 className="font-semibold text-fg">Personal details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <TextField label="Email" value={user?.email ?? ''} disabled hint="Contact support to change your email." />
        <TextField label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {user?.created_at && <p className="text-xs text-subtle">Member since {formatDate(user.created_at)}</p>}
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>

      <form onSubmit={changePassword} className="space-y-4">
        <h3 className="font-semibold text-fg">Change password</h3>
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          error={pwErrors.old_password}
          required />
        
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={pwErrors.new_password}
          minLength={8}
          required />
        
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={pwErrors.new_password_confirm}
          required />
        
        <Button type="submit" variant="secondary" loading={changing}>
          Update password
        </Button>
      </form>
    </div>);

}