import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, validationErrorsByField } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setError('');
    setFieldErrors({});
    try {
      await register(username, email, password);
      navigate('/');
    } catch (requestError) {
      setFieldErrors(validationErrorsByField(requestError));
      setError(
        requestError instanceof ApiError && requestError.code === 'USER_EXISTS'
          ? 'That username or email is already in use.'
          : requestError instanceof Error
            ? requestError.message
            : 'Registration failed',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[32rem] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <p className="eyebrow">Join the store</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already registered? <Link to="/login" className="font-medium text-primary hover:text-primary-hover">Sign in</Link>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <div className="alert-error" role="alert">{error}</div>}
          <div className="space-y-4">
            <Input label="Username" type="text" autoComplete="username" minLength={3} maxLength={50} required value={username} onChange={(event) => setUsername(event.target.value)} error={fieldErrors.username} helperText="3 to 50 characters" />
            <Input label="Email address" type="email" autoComplete="email" maxLength={255} required value={email} onChange={(event) => setEmail(event.target.value)} error={fieldErrors.email} />
            <Input label="Password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} error={fieldErrors.password} helperText="8 to 128 characters" />
            <Input label="Confirm password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={fieldErrors.confirmPassword} />
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Create account</Button>
        </form>
      </div>
    </div>
  );
}
