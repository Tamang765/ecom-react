import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, validationErrorsByField } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await login(email, password);
      navigate('/');
    } catch (requestError) {
      setFieldErrors(validationErrorsByField(requestError));
      setError(
        requestError instanceof ApiError && requestError.code === 'INVALID_CREDENTIALS'
          ? 'The email or password is incorrect.'
          : requestError instanceof Error
            ? requestError.message
            : 'Login failed',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[32rem] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="text-center">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or <Link to="/register" className="font-medium text-primary hover:text-primary-hover">create a new account</Link>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <div className="alert-error" role="alert">{error}</div>}
          <div className="space-y-4">
            <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} error={fieldErrors.email} />
            <Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} error={fieldErrors.password} />
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Sign in</Button>
        </form>
      </div>
    </div>
  );
}
