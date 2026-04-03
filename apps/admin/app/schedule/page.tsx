import { prisma } from '@repo/db';
import ScheduleManager from './components/ScheduleManager';

export const dynamic = 'force-dynamic';

const SchedulePage = async () => {
  const [locations, windows] = await Promise.all([
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
    prisma.locationWindow.findMany({
      include: { location: { select: { id: true, name: true } } },
      orderBy: { startDate: 'asc' }
    })
  ]);

  const serializedWindows = windows.map((w) => ({
    id: w.id,
    startDate: w.startDate.toISOString(),
    endDate: w.endDate.toISOString(),
    notes: w.notes,
    location: w.location
  }));

  return (
    <div className="px-8 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Schedule</h1>
      <ScheduleManager initialLocations={locations} initialWindows={serializedWindows} />
    </div>
  );
};

export default SchedulePage;
