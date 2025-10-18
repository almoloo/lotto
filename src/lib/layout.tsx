import { NavLink, Outlet } from 'react-router';
import { useFlowCurrentUser, Connect } from '@onflow/react-sdk';

export default function Layout() {
	const { user } = useFlowCurrentUser();

	return (
		<div>
			<h1>My App</h1>
			<div className="flex gap-10">
				<NavLink
					to="/"
					className="text-blue-500 underline"
				>
					Homepage
				</NavLink>
				<NavLink
					to="/create"
					className="text-blue-500 underline"
				>
					Create Lotto
				</NavLink>
				<div className="ml-auto">
					{user?.loggedIn ? `Hello, ${user.addr}` : <Connect />}
				</div>
			</div>
			<Outlet />
		</div>
	);
}
