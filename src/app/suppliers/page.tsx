'use client';

import { Suspense } from 'react';
import SupplierDirectory from '../../pages/SupplierDirectory';

export default function SuppliersPage() {
  return (
    <Suspense>
      <SupplierDirectory />
    </Suspense>
  );
}
