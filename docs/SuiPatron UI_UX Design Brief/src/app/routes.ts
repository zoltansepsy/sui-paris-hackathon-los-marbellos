import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Landing } from './pages/Landing';
import { Explore } from './pages/Explore';
import { CreatorProfile } from './pages/CreatorProfile';
import { Dashboard } from './pages/Dashboard';
import { Feed } from './pages/Feed';
import { Settings } from './pages/Settings';
import { AuthCallback } from './pages/AuthCallback';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: 'explore', Component: Explore },
      { path: 'creator/:id', Component: CreatorProfile },
      { path: 'dashboard', Component: Dashboard },
      { path: 'feed', Component: Feed },
      { path: 'settings', Component: Settings },
      { path: 'auth/callback', Component: AuthCallback },
      { path: '*', Component: NotFound },
    ],
  },
]);
