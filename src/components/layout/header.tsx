import { NavLink } from 'react-router';
import { Connect, useFlowCurrentUser } from '@onflow/react-sdk';
import {
	NavigationMenu,
	NavigationMenuLink,
} from '@/components/ui/navigation-menu';

export default function Header() {
	const { user } = useFlowCurrentUser();

	return (
		<header className="flex items-center px-5 xl:px-10 py-5 gap-3">
			<NavLink
				to="/"
				className="mr-auto"
			>
				<h1 className="font-black text-3xl text-emerald-900">lotto</h1>
			</NavLink>
			{user && user.addr && (
				<NavigationMenu className="space-x-3">
					<NavigationMenuLink asChild>
						<NavLink to="create">Create Lotto</NavLink>
					</NavigationMenuLink>
					<NavigationMenuLink asChild>
						<NavLink to="/mysessions">My Lottos</NavLink>
					</NavigationMenuLink>
				</NavigationMenu>
			)}
			<div className="">
				<Connect />
			</div>
		</header>
	);
}
