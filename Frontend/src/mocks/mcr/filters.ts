import type { FilterOptions } from '../../types/mcr';

export const mockFilterOptions: FilterOptions = {
  coaches: [
    { id: 'coach-001', name: 'Dr. Sarah Mitchell' },
    { id: 'coach-002', name: 'Dr. Michael Chen' },
    { id: 'coach-003', name: 'Dr. Emma Davis' },
    { id: 'coach-004', name: 'Dr. James Roberts' },
    { id: 'coach-005', name: 'Dr. Jennifer Lee' },
  ],
  programmes: [
    { id: 'prog-001', name: 'Level 6 Digital Marketing' },
    { id: 'prog-002', name: 'Level 5 Business Admin' },
    { id: 'prog-003', name: 'Level 4 IT Support' },
    { id: 'prog-004', name: 'Level 5 Project Management' },
    { id: 'prog-005', name: 'Level 4 Data Analytics' },
  ],
  groups: [
    { id: 'group-001', name: 'Cohort A - September 2024' },
    { id: 'group-002', name: 'Cohort B - October 2024' },
    { id: 'group-003', name: 'Cohort C - November 2024' },
    { id: 'group-004', name: 'Cohort D - December 2024' },
  ],
};