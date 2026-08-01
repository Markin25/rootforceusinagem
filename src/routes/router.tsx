import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@layout/RootLayout';
import Home from '@features/home/Home';
import NotFound from '@pages/NotFound';

// Rootforce is a single-page site — all content lives on Home as anchor
// sections. These legacy paths only exist to redirect anyone with an old
// bookmark, shared link, or indexed search result to the right section
// instead of rendering a stale standalone page.
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'servicos', element: <Navigate to="/#servicos" replace /> },
      { path: 'sobre', element: <Navigate to="/#sobre" replace /> },
      { path: 'contato', element: <Navigate to="/#contato" replace /> },
      // Carreiras ainda não está ativa no site — redireciona para a home
      { path: 'carreiras', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
