import Link from 'next/link';

import NewVoucherForm from '../components/NewVoucherForm';

const NewVoucherPage = () => (
  <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
    <header>
      <Link href="/vouchers" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to vouchers
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">New voucher</h1>
      <p className="text-sm text-slate-500">
        For a voucher you want to give someone by hand. Referral vouchers are created automatically
        when a booking names a referrer.
      </p>
    </header>
    <NewVoucherForm />
  </main>
);

export default NewVoucherPage;
