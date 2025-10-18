import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import HomepageView from '../routes/Homepage';
import CreateLottoView from '../routes/CreateLotto';
import Layout from './layout';

const router = createBrowserRouter([
	{
		Component: Layout,
		children: [
			{
				element: <HomepageView />,
				index: true,
			},
			{
				path: '/create',
				element: <CreateLottoView />,
			},
		],
	},
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
