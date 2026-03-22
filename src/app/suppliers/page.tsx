'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import SupplierDirectory from '../../pages/SupplierDirectory';

export default function SuppliersPage() {
  return (
    <Suspense>
      <SupplierDirectory />
    </Suspense>
  );
}
