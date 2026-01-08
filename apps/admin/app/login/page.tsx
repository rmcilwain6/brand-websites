import { Button, Card } from '@repo/ui';
import Link from 'next/link';

const LoginPage = ({ searchParams }: { searchParams?: { error?: string } }) => {
  const showError = searchParams?.error === '1';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <Card title="Admin login" className="w-full max-w-md">
        <form action="/api/login" method="post" className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Admin password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          {showError && (
            <p className="text-sm text-rose-600" role="alert">
              Invalid password. Please try again.
            </p>
          )}
          <div className="flex items-center justify-between">
            <Button type="submit">Sign in</Button>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              Back to admin
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
};

export default LoginPage;
