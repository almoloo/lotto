import { formatAddress, generateExplorerLink } from '@/lib/utils';
import { NavLink } from 'react-router';

export default function ParticipantItem({
	address,
	tickets,
}: {
	address: string;
	tickets: number;
}) {
	return (
		<div className="flex items-center justify-between bg-white/75 p-3 rounded">
			<span className="font-mono text-blue-600 hover:underline text-sm">
				<NavLink
					to={generateExplorerLink(address, 'account')}
					target="_blank"
				>
					{formatAddress(address)}
				</NavLink>
			</span>
			<span className="text-sm font-bold">
				{tickets} ticket
				{tickets > 1 ? 's' : ''}
			</span>
		</div>
	);
}
