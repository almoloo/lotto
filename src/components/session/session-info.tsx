import { calculateTimeRemaining, formatAddress } from '@/lib/utils';
import type { SessionInfo } from '@/types/session';
import {
	AlarmClockIcon,
	BadgeDollarSignIcon,
	HourglassIcon,
	ShieldUserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

interface SessionInfoProps {
	participantTickets: { [key: string]: string };
	ticketPrice: string;
	endTime: string;
	creator: string;
}

export default function SessionInfo({
	participantTickets,
	ticketPrice,
	endTime,
	creator,
}: SessionInfoProps) {
	const [soldTickets, setSoldTickets] = useState<number>(0);
	const [prizePool, setPrizePool] = useState<number>(0);
	const [timeRemaining, setTimeRemaining] = useState<string>('');

	useEffect(() => {
		if (!participantTickets) return;
		const totalTickets = Object.values(participantTickets).reduce(
			(acc, count) => acc + Number(count),
			0
		);
		setSoldTickets(totalTickets);
	}, [participantTickets]);

	useEffect(() => {
		const totalTickets = Object.values(participantTickets).reduce(
			(acc, count) => acc + Number(count),
			0
		);
		setPrizePool(totalTickets * parseFloat(ticketPrice));
	}, [participantTickets, ticketPrice]);

	useEffect(() => {
		const interval = setInterval(() => {
			const endTime2 = Number(endTime) * 1000;
			const now = Date.now();
			const diff = endTime2 - now;

			if (diff <= 0) {
				setTimeRemaining('Ended');
				clearInterval(interval);
			} else {
				setTimeRemaining(calculateTimeRemaining(endTime)!);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [endTime]);

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
							// to={generateExplorerLink(
							// 	session.creator,
							// 	'account'
							// )}
							to={`/u/${creator}`}
							// target="_blank"
						>
							{formatAddress(creator)}
						</NavLink>
					</span>
				</div>
				<div className="flex items-center gap-2">
					<AlarmClockIcon className="size-5 text-slate-400" />
					<span className="text-sm text-slate-700">
						Deadline:{' '}
						{new Date(parseFloat(endTime) * 1000).toLocaleString()}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<HourglassIcon className="size-5 text-slate-400" />
					<span className="text-sm text-slate-700">
						Time Remaining: {timeRemaining}
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
