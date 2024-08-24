'use client'

import { useRouter } from 'next/router';
import CompanyUpdateForm from '@/components/company-info-update';
import "@/styles/globals.css";

const CompanyUpdatePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const companyId = typeof id === 'string' ? id : undefined;

  return (
    <div className="container mx-auto mt-8">
      {companyId && <CompanyUpdateForm companyId={companyId} />}
    </div>
  );
};

export default CompanyUpdatePage;
