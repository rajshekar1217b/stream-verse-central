
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AdminLoginPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Attempt login with the PIN (8579)
    const success = login(pin);
    
    setIsLoading(false);
    
    if (success) {
      toast.success("Login successful");
      navigate('/admin');
    } else {
      toast.error("Incorrect PIN");
      // Clear input on failure
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-ott-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-ott-card p-8 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-ott-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-gray-400 mt-2">
              Enter the admin PIN to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="admin-input"
                maxLength={4}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-ott-accent hover:bg-ott-accent/80"
              disabled={isLoading || pin.length < 4}
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>This area is restricted to administrators only.</p>
            <p className="mt-2">(Use PIN: 8579)</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLoginPage;
