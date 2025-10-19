import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import HomepageView from '../routes/Homepage';
import CreateLottoView from '../routes/CreateLotto';
import Layout from './layout';
import UserProfileView from '../routes/UserProfile';
import LotterySessionView from '../routes/Session';

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
			{
				path: '/u/:address',
				element: <UserProfileView />,
				loader: async ({ params }) => {
					return { address: params.address };
				},
			},
			{
				path: '/session/:sessionId',
				element: <LotterySessionView />,
				loader: async ({ params }) => {
					return { sessionId: params.sessionId };
				},
			},
		],
	},
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}
