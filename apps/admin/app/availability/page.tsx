import { prisma } from '@repo/db';
import AvailabilityManager from './components/AvailabilityManager';

export const dynamic = 'force-dynamic';

const AvailabilityPage = async () => {
  const slots = await prisma.timeSlot.findMany({ orderBy: { startsAt: 'asc' } });

  const serialized = slots.map((s) => ({
    id: s.id,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
    status: s.status as 'AVAILABLE' | 'HELD' | 'UNAVAILABLE'
  }));

  return (
    <div className="px-8 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Availability</h1>
      <AvailabilityManager initialSlots={serialized} />
    </div>
  );
};

export default AvailabilityPage;
