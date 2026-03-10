import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const McrDashboard = lazy(() => import('../pages/mcr-dashboard/page'));
const McrReviews = lazy(() => import('../pages/mcr-reviews/page'));
const McrReviewDetail = lazy(() => import('../pages/mcr-review-detail/page'));
const McrReviewPrint = lazy(() => import('../pages/mcr-review-print/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <McrDashboard />,
  },
  {
    path: '/mcr/dashboard',
    element: <McrDashboard />,
  },
  {
    path: '/mcr/reviews',
    element: <McrReviews />,
  },
  {
    path: '/mcr/reviews/:id',
    element: <McrReviewDetail />,
  },
  {
    path: '/mcr/reviews/:id/print',
    element: <McrReviewPrint />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;