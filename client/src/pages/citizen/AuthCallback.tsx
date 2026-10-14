import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenAuth } from '../../context/CitizenAuthContext.js';
import { Loader2, ShieldCheck } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isCitizenAuthenticated, isLoading } = useCitizenAuth();

  useEffect(() => {
    // If citizen is authenticated or loading finishes, navigate to home dashboard
    if (isCitizenAuthenticated) {
      navigate('/', { replace: true });
    } else if (!isLoading) {
      // Allow 1.5 seconds for Supabase hash/code processing then redirect to home
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isCitizenAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Google प्रमाणीकरण सत्यापित हो रहा है...
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          कृपया कुछ क्षण प्रतीक्षा करें, आपके नागरिक डैशबोर्ड पर पुनः निर्देशित किया जा रहा है।
        </p>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>सुरक्षित Supabase OAuth सत्र</span>
      </div>
    </div>
  );
};
