import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../pages/Dashboard';
import { Investigations } from '../pages/Investigations';
import { InvestigationDetail } from '../pages/InvestigationDetail';
import { Repositories } from '../pages/Repositories';
import { Evidence } from '../pages/Evidence';
import { Tests } from '../pages/Tests';
import { Reviews } from '../pages/Reviews';
import { History } from '../pages/History';
import { Settings } from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'investigations',
        element: <Investigations />,
      },
      {
        path: 'investigations/:id',
        element: <InvestigationDetail />,
      },
      {
        path: 'repositories',
        element: <Repositories />,
      },
      {
        path: 'evidence',
        element: <Evidence />,
      },
      {
        path: 'tests',
        element: <Tests />,
      },
      {
        path: 'reviews',
        element: <Reviews />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
