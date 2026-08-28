import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, validationErrorsByField } from '@/lib/api';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, updateProfile, deleteAccount } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  if (authLoading) {
    return <div className="container py-8"><div className="h-72 animate-pulse rounded-lg bg-gray-200" /></div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-4 text-gray-600">Log in to manage your account.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>Log in</Button>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    const update = {
      ...(username !== user.username ? { username } : {}),
      ...(email !== user.email ? { email } : {}),
      ...(password ? { password } : {}),
    };

    if (Object.keys(update).length === 0) {
      setError('Make at least one change before saving.');
      setIsSaving(false);
      return;
    }

    try {
      await updateProfile(update);
      setPassword('');
      setSuccess('Profile updated successfully.');
    } catch (requestError) {
      setFieldErrors(validationErrorsByField(requestError));
      setError(
        requestError instanceof ApiError && requestError.code === 'USER_EXISTS'
          ? 'That username or email is already in use.'
          : requestError instanceof Error
            ? requestError.message
            : 'Could not update your profile',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account and all of its cart and order data? This cannot be undone.')) return;
    setIsDeleting(true);
    setError('');
    try {
      await deleteAccount();
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete your account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="container max-w-2xl py-10">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">My profile</h1>
      <p className="mt-2 text-gray-600">Keep your account details current and secure.</p>
      <div className="card mt-8 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Account details</h2>
        {success && <div className="alert-success mt-4" role="status">{success}</div>}
        {error && <div className="alert-error mt-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Username" autoComplete="username" minLength={3} maxLength={50} required value={username} onChange={(event) => setUsername(event.target.value)} error={fieldErrors.username} />
          <Input label="Email" type="email" autoComplete="email" maxLength={255} required value={email} onChange={(event) => setEmail(event.target.value)} error={fieldErrors.email} />
          <Input label="New password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} error={fieldErrors.password} helperText="Leave blank to keep your current password" />
          <Button type="submit" isLoading={isSaving}>Save Changes</Button>
        </form>
      </div>
      <div className="card mt-6 border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-700">Delete account</h2>
        <p className="mt-2 text-sm text-gray-600">Permanently deletes your profile, cart, and order history.</p>
        <Button variant="danger" className="mt-4" onClick={handleDelete} isLoading={isDeleting}>Delete Account</Button>
      </div>
      </div>
    </div>
  );
}
