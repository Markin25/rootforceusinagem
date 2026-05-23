import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@layout/RootLayout';
import Home from '@features/home/Home';
import Services from '@features/services/Services';
import About from '@features/about/About';
import Contact from '@features/contact/Contact';
// import Careers from '@features/careers/Careers';
import NotFound from '@pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'servicos', element: <Services /> },
      { path: 'sobre', element: <About /> },
      { path: 'contato', element: <Contact /> },
      // { path: 'carreiras', element: <Careers /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
