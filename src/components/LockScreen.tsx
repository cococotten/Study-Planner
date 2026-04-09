import * as React from 'react';
import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password === '1101') {
      onUnlock();
    } else {
      setError(true);
      setPassword('');
      // Reset error after a short shake animation duration
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFDFB] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-sm border-slate-200 shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100">
              <Lock size={20} />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Study Flow</CardTitle>
            <CardDescription className="text-slate-500">Enter password to access your planner</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={error ? 'error' : 'normal'}
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Input
                      type="password"
                      placeholder="••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={error ? "border-red-400 focus-visible:ring-red-100" : "text-center tracking-[0.5em] font-mono"}
                      autoFocus
                    />
                  </motion.div>
                </AnimatePresence>
                {error && (
                  <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    Incorrect Password
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-slate-800 hover:bg-slate-900 text-white transition-all group"
              >
                Unlock Planner
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
