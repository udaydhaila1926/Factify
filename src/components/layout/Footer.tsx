import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t py-12 mt-auto">
      <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Factify. Built for truth.</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-blue-600">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600">Terms of Service</a>
          <a href="#" className="hover:text-blue-600">API</a>
        </div>
      </div>
    </footer>
  );
};
