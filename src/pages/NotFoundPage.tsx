
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ott-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-lg">
          <h1 className="text-6xl font-bold text-ott-accent mb-6">404</h1>
          <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            Oops! It looks like you've ventured into unknown territory. 
            The content you're looking for might have moved, been deleted, 
            or perhaps never existed in the first place.
          </p>

          <Link to="/">
            <Button className="bg-ott-accent hover:bg-ott-accent/80">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
