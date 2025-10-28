import { NavLink } from 'react-router';
import { Connect, useFlowCurrentUser } from '@onflow/react-sdk';

function NavLinkWrapper({
	to,
	children,
}: {
	to: string;
	children: React.ReactNode;
}) {
	return (
		<NavLink
			to={to}
			className="text-slate-900 hover:underline"
		>
			{children}
		</NavLink>
	);
}

export default function Header() {
	const { user } = useFlowCurrentUser();

	return (
		<header className="flex items-center px-5 xl:px-10 py-5 gap-10">
			<NavLink to="/">
				<h1 className="font-black text-3xl text-emerald-900">lotto</h1>
			</NavLink>
			<nav className="flex gap-5 ml-auto">
				{user && user.addr && (
					<>
						<NavLinkWrapper to="create">
							Create Lotto
						</NavLinkWrapper>
						<NavLinkWrapper to="/mysessions">
							My Lottos
						</NavLinkWrapper>
						<NavLinkWrapper to="/tickets">
							My Tickets
						</NavLinkWrapper>
					</>
				)}
			</nav>
			<div className="">
				<Connect />
			</div>
		</header>
	);
}
