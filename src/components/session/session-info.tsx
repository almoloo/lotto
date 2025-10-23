import { formatAddress, generateExplorerLink } from '@/lib/utils';
import type { SessionInfo } from '@/types/session';
import {
	AlarmClockIcon,
	BadgeDollarSignIcon,
	HourglassIcon,
	ShieldUserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

export default function SessionInfo({ session }: { session: SessionInfo }) {
	const [soldTickets, setSoldTickets] = useState<number>(0);
	const [prizePool, setPrizePool] = useState<number>(0);

	useEffect(() => {
		const totalTickets = Object.values(session.participantTickets).reduce(
			(acc, count) => acc + Number(count),
			0
		);
		setSoldTickets(totalTickets);
	}, [session.participantTickets]);

	useEffect(() => {
		const totalTickets = Object.values(session.participantTickets).reduce(
			(acc, count) => acc + Number(count),
			0
		);
		setPrizePool(totalTickets * parseFloat(session.ticketPrice));
	}, [session.participantTickets, session.ticketPrice]);

	// Calculate time remaining
	const endTime = parseFloat(session.endTime) * 1000;
	const now = Date.now();
	const timeRemaining = endTime - now;

	// Format time remaining
	const formatTimeRemaining = (ms: number) => {
		if (ms <= 0) return 'Ended';
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ${hours % 24}h`;
		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
		return `${seconds}s`;
	};

	return (
		<section className="flex justify-between items-center bg-slate-100 p-5 xl:p-10 rounded-3xl">
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<ShieldUserIcon className="size-5 text-slate-400" />
					<span className="text-sm text-slate-700">
						Created by{' '}
						<NavLink
							className={
								'font-mono text-blue-600 hover:underline'
							}
							to={generateExplorerLink(
								session.creator,
								'account'
							)}
							target="_blank"
						>
							{formatAddress(session.creator)}
						</NavLink>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<AlarmClockIcon className="size-5 text-slate-400" />
					<span className="text-sm text-slate-700">
						Deadline: {new Date(endTime).toLocaleString()}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<HourglassIcon className="size-5 text-slate-400" />
					<span className="text-sm text-slate-700">
						Time Remaining: {formatTimeRemaining(timeRemaining)}
					</span>
				</div>
			</div>
			<div className="space-y-1 shrink-0 border-l border-slate-300 pl-5 xl:pl-10 ml-5 xl:ml-10 border-dashed">
				<small className="flex items-center gap-2 text-sm text-slate-400">
					<BadgeDollarSignIcon className="size-4" />
					<span>Total Prize Pool</span>
				</small>
				<div>
					<h2 className="font-bold text-3xl text-orange-500">
						{prizePool.toFixed(2)} FLOW
					</h2>
					<small className="text-sm text-slate-700">
						{soldTickets} Tickets Sold
					</small>
				</div>
			</div>
		</section>
	);
}
