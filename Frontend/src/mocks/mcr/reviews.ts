import type { McrReview, NamedEntity, RagStatus } from '../../types/mcr';

const entity = (id: string, name: string, email?: string): NamedEntity => ({
  id,
  name,
  ...(email ? { email } : {}),
});

const makeReview = (input: {
  id: string;
  date: string;
  coach: NamedEntity;
  learner: NamedEntity;
  programme: NamedEntity;
  group: NamedEntity;
  duration: number;
  ragStatus: RagStatus;
  qualitativeRating: string;
  safeguardingFlagged: boolean;
  satisfactionScore: number;
  overallQaScore: number;
  communicatedTo: { employer: boolean; learner: boolean; qa: boolean };
}): McrReview => ({
  id: input.id,
  date: input.date,
  coach: input.coach,
  learner: input.learner,
  programme: input.programme,
  group: input.group,
  meetingLink: 'https://meet.example.com/' + input.id,
  totalDurationMin: input.duration,
  ragStatus: input.ragStatus,
  qualitativeRating: input.qualitativeRating,
  createdAt: input.date,
  updatedAt: input.date,
  safeguardingFlagged: input.safeguardingFlagged,
  satisfactionScore: input.satisfactionScore,
  overallQaScore: input.overallQaScore,
  communicatedTo: input.communicatedTo,
});

export const reviews: McrReview[] = [
  makeReview({
    id: 'mcr-001',
    date: '2024-01-15T10:00:00Z',
    coach: entity('coach-1', 'Sarah Johnson'),
    learner: entity('learner-1', 'James Smith', 'james.smith@example.com'),
    programme: entity('prog-1', 'Business Administration Level 3'),
    group: entity('group-1', 'Cohort A - September 2024'),
    duration: 55,
    ragStatus: 'Green',
    qualitativeRating: 'Outstanding',
    safeguardingFlagged: false,
    satisfactionScore: 4.8,
    overallQaScore: 4.7,
    communicatedTo: { employer: true, learner: true, qa: true },
  }),
  makeReview({
    id: 'mcr-002',
    date: '2024-02-14T14:30:00Z',
    coach: entity('coach-2', 'Michael Chen'),
    learner: entity('learner-2', 'Emily Davis', 'emily.davis@example.com'),
    programme: entity('prog-2', 'Digital Marketing Level 4'),
    group: entity('group-2', 'Cohort B - October 2024'),
    duration: 48,
    ragStatus: 'Amber',
    qualitativeRating: 'Good',
    safeguardingFlagged: false,
    satisfactionScore: 3.9,
    overallQaScore: 3.8,
    communicatedTo: { employer: true, learner: true, qa: false },
  }),
  makeReview({
    id: 'mcr-003',
    date: '2024-03-12T13:00:00Z',
    coach: entity('coach-1', 'Sarah Johnson'),
    learner: entity('learner-3', 'Sophie Wilson', 'sophie.wilson@example.com'),
    programme: entity('prog-3', 'Project Management Level 4'),
    group: entity('group-1', 'Cohort A - September 2024'),
    duration: 42,
    ragStatus: 'Red',
    qualitativeRating: 'Requires Improvement',
    safeguardingFlagged: true,
    satisfactionScore: 2.5,
    overallQaScore: 2.8,
    communicatedTo: { employer: false, learner: true, qa: true },
  }),
  makeReview({
    id: 'mcr-004',
    date: '2024-03-22T11:30:00Z',
    coach: entity('coach-4', 'David Brown'),
    learner: entity('learner-4', 'Harry Thompson', 'harry.thompson@example.com'),
    programme: entity('prog-4', 'Data Analytics Level 4'),
    group: entity('group-4', 'Cohort D - December 2024'),
    duration: 51,
    ragStatus: 'Amber',
    qualitativeRating: 'Good',
    safeguardingFlagged: false,
    satisfactionScore: 4.2,
    overallQaScore: 3.9,
    communicatedTo: { employer: true, learner: false, qa: true },
  }),
  makeReview({
    id: 'mcr-005',
    date: '2024-04-10T15:00:00Z',
    coach: entity('coach-5', 'Lisa Anderson'),
    learner: entity('learner-5', 'Amelia Roberts', 'amelia.roberts@example.com'),
    programme: entity('prog-1', 'Business Administration Level 3'),
    group: entity('group-2', 'Cohort B - October 2024'),
    duration: 58,
    ragStatus: 'Green',
    qualitativeRating: 'Outstanding',
    safeguardingFlagged: false,
    satisfactionScore: 4.7,
    overallQaScore: 4.6,
    communicatedTo: { employer: true, learner: true, qa: true },
  }),
  makeReview({
    id: 'mcr-006',
    date: '2024-07-18T15:30:00Z',
    coach: entity('coach-2', 'Michael Chen'),
    learner: entity('learner-6', 'Ava White', 'ava.white@example.com'),
    programme: entity('prog-2', 'Digital Marketing Level 4'),
    group: entity('group-1', 'Cohort A - September 2024'),
    duration: 44,
    ragStatus: 'Red',
    qualitativeRating: 'Inadequate',
    safeguardingFlagged: true,
    satisfactionScore: 2.1,
    overallQaScore: 2.0,
    communicatedTo: { employer: true, learner: true, qa: true },
  }),
];

export const mockReviews = reviews;
