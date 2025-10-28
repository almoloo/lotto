import type { SessionInfo } from '@/types/session';
import { NavLink } from 'react-router';
import StatusBadge from '@/components/session/status-badge';
import { useEffect, useState } from 'react';
import { LoaderIcon } from 'lucide-react';
import { calculateTimeRemaining } from '@/lib/utils';

interface SessionListItemProps {
	session: SessionInfo;
}

export default function SessionListItem({ session }: SessionListItemProps) {
	const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			const endTime = Number(session.endTime) * 1000;
			const now = Date.now();
			const diff = endTime - now;

			if (diff <= 0) {
				setTimeRemaining('Ended');
				clearInterval(interval);
			} else {
				setTimeRemaining(calculateTimeRemaining(session.endTime));
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [session.endTime]);

	return (
		<NavLink
			to={`/session/${session.creator}/${session.sessionID}`}
			className="no-underline text-inherit"
		>
			<div className="flex flex-col rounded-xl bg-slate-50 border gap-2 px-5 pt-3">
				<div className="flex items-center justify-between">
					<h4 className="text-lg font-medium">
						Session #{session.sessionID}
					</h4>
					<StatusBadge
						isActive={session.isActive}
						isEnded={session.isEnded}
						endTime={session.endTime}
						startTime={session.createdAt}
					/>
				</div>
				<div>
					<div>
						<span className="text-slate-500 font-medium text-sm">
							Total Pool
						</span>
						<span className="ml-2 text-sm font-semibold">
							{session.totalPool} FLOW
						</span>
					</div>
					<div>
						<span className="text-slate-500 font-medium text-sm">
							Tickets Sold
						</span>
						<span className="ml-2 text-sm font-semibold">
							{session.totalTickets}
						</span>
					</div>
					<div>
						<span className="text-slate-500 font-medium text-sm">
							Participants
						</span>
						<span className="ml-2 text-sm font-semibold">
							{Object.keys(session.participantTickets).length}
						</span>
					</div>
				</div>
				<div className="flex items-end">
					<div className="font-mono mx-auto bg-slate-100 px-3 py-2 rounded-t-lg text-sm border border-b-0 min-w-[200px] text-center">
						{timeRemaining ? (
							timeRemaining
						) : (
							<LoaderIcon className="inline-block h-4 w-4 animate-spin" />
						)}
					</div>
				</div>
			</div>
		</NavLink>
	);
}
