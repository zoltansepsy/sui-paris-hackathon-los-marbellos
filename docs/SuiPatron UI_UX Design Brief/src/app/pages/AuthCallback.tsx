import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Simulate OAuth callback processing
    const returnTo = searchParams.get('returnTo') || '/explore';
    
    setTimeout(() => {
      navigate(returnTo);
    }, 1000);
  }, [navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
      <p className="text-lg font-medium">Signing you in...</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait a moment</p>
    </div>
  );
}
