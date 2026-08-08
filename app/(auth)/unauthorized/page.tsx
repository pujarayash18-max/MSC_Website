'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <Card className="max-w-md w-full p-4 text-center border-rose-500/30">
        <CardHeader>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Access Denied</CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            You do not have permission to access this module. Check your RBAC role permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Link href="/">
            <Button variant="fluent" className="w-full">
              <ArrowLeft className="w-4 h-4" /> Return to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
