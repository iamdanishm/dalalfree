import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useUserProperties() {
  const { data: session, status } = useSession();
  const [hasProperties, setHasProperties] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only check if user is authenticated
    if (status === 'authenticated' && session?.user) {
      checkUserProperties();
    } else if (status === 'unauthenticated') {
      // Reset state when user logs out
      setHasProperties(false);
      setLoading(false);
      setError(null);
    }
  }, [status, session]);

  const checkUserProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users/properties?action=count');

      if (!response.ok) {
        throw new Error('Failed to check user properties');
      }

      const data = await response.json();

      if (data.success) {
        setHasProperties(data.hasProperties);
      } else {
        throw new Error(data.error || 'Failed to check properties');
      }
    } catch (err) {
      console.error('Error checking user properties:', err);
      setError(err.message);
      setHasProperties(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasProperties,
    loading,
    error,
    refetch: checkUserProperties
  };
}