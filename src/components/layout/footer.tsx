import { CoffeeIcon, GithubIcon } from 'lucide-react';
import { NavLink } from 'react-router';

export default function Footer() {
	return (
		<footer className="flex items-center px-5 xl:px-10 py-5 justify-between">
			<div className="flex items-center gap-2">
				<CoffeeIcon className="text-slate-600 size-5" />
				<p className="text-xs text-slate-500">
					Made with lots of caffeine by{' '}
					<NavLink
						to="https://github.com/almoloo"
						className="text-emerald-900 hover:underline"
					>
						almoloo
					</NavLink>
					.
				</p>
			</div>
			<div>
				<NavLink to="https://github.com/almoloo/lotto">
					<GithubIcon className="text-slate-600 size-5" />
				</NavLink>
			</div>
		</footer>
	);
}
