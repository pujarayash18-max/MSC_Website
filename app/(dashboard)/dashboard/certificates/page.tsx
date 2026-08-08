'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { Award, Download, Eye, CheckCircle2, ExternalLink } from 'lucide-react';

const MOCK_CERTIFICATES = [
  {
    certificateId: 'cert_az_001',
    eventName: 'Azure Cloud Architecture & Serverless Masterclass',
    type: 'Participation',
    verificationId: 'MCC-CERT-2026-881920',
    issueDate: 'Aug 25, 2026',
    blobUrl: 'https://mccdevstorage.blob.core.windows.net/certificates/MCC-CERT-2026-881920.pdf'
  },
  {
    certificateId: 'cert_hk_002',
    eventName: 'National Azure AI Hackathon 2026',
    type: 'Winner (1st Place)',
    verificationId: 'MCC-CERT-2026-993012',
    issueDate: 'Aug 16, 2026',
    blobUrl: 'https://mccdevstorage.blob.core.windows.net/certificates/MCC-CERT-2026-993012.pdf'
  }
];

export default function StudentCertificatesPage() {
  const handleDownload = (verificationId: string) => {
    toast.success(`Downloading official certificate ${verificationId}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-sky-400" /> My Verified Certificates (§49)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Download high-resolution official PDF certificates and share public verification credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_CERTIFICATES.map((cert) => (
          <Card key={cert.certificateId} className="p-6 space-y-4 border-slate-800 hover:border-sky-500/50 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Badge variant={cert.type.includes('Winner') ? 'warning' : 'primary'}>{cert.type}</Badge>
                <h3 className="text-lg font-bold text-white pt-1">{cert.eventName}</h3>
                <p className="text-xs font-mono text-sky-400 font-bold">ID: {cert.verificationId}</p>
              </div>
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <span>Issued: {cert.issueDate}</span>

              <div className="flex items-center gap-2">
                <Link href={`/verify-certificate/${cert.verificationId}`} target="_blank">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Verify Link
                  </Button>
                </Link>

                <Button variant="fluent" size="sm" onClick={() => handleDownload(cert.verificationId)}>
                  <Download className="w-3.5 h-3.5" /> PDF
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
