'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { Award, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const MOCK_CERTIFICATES = [
  {
    certificateId: 'cert_az_001',
    eventName: 'Azure Cloud Architecture & Serverless Masterclass',
    type: 'Participation',
    verificationId: 'MCC-CERT-2026-AZ8801',
    issueDate: 'Aug 25, 2026',
    blobUrl: '/uploads/certificates/MCC-CERT-2026-AZ8801.pdf'
  },
  {
    certificateId: 'cert_hk_002',
    eventName: 'National Azure AI Hackathon 2026',
    type: 'Winner (1st Place)',
    verificationId: 'MCC-CERT-2026-HK9902',
    issueDate: 'Aug 16, 2026',
    blobUrl: '/uploads/certificates/MCC-CERT-2026-HK9902.pdf'
  }
];

async function fetchStudentCertificates() {
  const res = await fetch('/api/certificates');
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.certificates || [];
}

function mapDbCertificate(c: any) {
  const typeMap: Record<string, string> = {
    'PARTICIPATION': 'Participation',
    'WINNER': 'Winner (1st Place)',
    'VOLUNTEER': 'Volunteer Appreciation',
    'SPEAKER': 'Guest Speaker Honor',
    'ORGANIZER': 'Organizer Recognition',
  };

  return {
    certificateId: c.id,
    eventName: c.event?.title || 'Microsoft Campus Club Event',
    type: typeMap[c.type] || c.type || 'Participation',
    verificationId: c.verificationCode || `MCC-CERT-${c.id.slice(0, 8).toUpperCase()}`,
    issueDate: c.generatedAt ? new Date(c.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    blobUrl: c.blobUrl || `/api/certificates/${c.id}/download`,
  };
}

export default function StudentCertificatesPage() {
  const { data: dbCertificates = [], isLoading } = useQuery({
    queryKey: ['student-certificates-list'],
    queryFn: fetchStudentCertificates,
  });

  const liveCertificates = dbCertificates.map(mapDbCertificate);
  const combinedCertificates = [
    ...liveCertificates,
    ...MOCK_CERTIFICATES.filter((m) => !liveCertificates.some((l: any) => l.certificateId === m.certificateId))
  ];

  const handleDownload = (cert: any) => {
    if (cert.blobUrl && cert.blobUrl.startsWith('/uploads/')) {
      const a = document.createElement('a');
      a.href = cert.blobUrl;
      a.download = `${cert.verificationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(`/api/certificates/${cert.certificateId}/download`, '_blank');
    }
    toast.success(`Downloading official certificate ${cert.verificationId}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A4EF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-[#7FBA00]" /> My Verified Certificates
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Download high-resolution official PDF certificates and share public verification credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {combinedCertificates.map((cert) => (
          <Card key={cert.certificateId} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] hover:border-[#7FBA00]/50 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Badge variant={cert.type.includes('Winner') ? 'warning' : 'primary'}>{cert.type}</Badge>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-1">{cert.eventName}</h3>
                <p className="text-xs font-mono text-[#00A4EF] font-bold">ID: {cert.verificationId}</p>
              </div>
              <Award className="w-8 h-8 text-[#FFB900] shrink-0" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#2A323D] text-xs text-slate-600 dark:text-[#A8B0BB]">
              <span>Issued: {cert.issueDate}</span>

              <div className="flex items-center gap-2">
                <Link href={`/verify-certificate/${cert.verificationId}`} target="_blank">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Verify Link
                  </Button>
                </Link>

                <Button variant="fluent" size="sm" onClick={() => handleDownload(cert)}>
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
