import ParticipantItem from '@/components/session/participant-item';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

interface ParticipantBoxProps {
	participants: { [key: string]: string };
}

export default function ParticipantBox(props: ParticipantBoxProps) {
	const [participantCount] = useState(Object.keys(props.participants).length);
	const [expanded, setExpanded] = useState(false);

	return (
		<section className="bg-slate-100 p-5 xl:p-10 rounded-3xl">
			<div className="flex items-center justify-between">
				<h2 className="font-bold">Participants ({participantCount})</h2>
				{participantCount > 0 && (
					<button
						className="text-sm flex items-center gap-1 cursor-pointer"
						onClick={() => setExpanded(!expanded)}
					>
						<span>{expanded ? 'Hide' : 'See All'}</span>
						{expanded ? (
							<ChevronDownIcon className="size-4 rotate-180" />
						) : (
							<ChevronDownIcon className="size-4" />
						)}
					</button>
				)}
			</div>
			{participantCount > 0 && (
				<div
					className={`mt-4 max-h-[300px] overflow-y-auto space-y-2 ${
						!expanded ? 'hidden' : ''
					}`}
				>
					{Object.entries(props.participants).map(
						([address, tickets]) => (
							<ParticipantItem
								address={address}
								tickets={Number(tickets)}
								key={address}
							/>
						)
					)}
				</div>
			)}
		</section>
	);
}
