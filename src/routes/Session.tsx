import { useParams } from 'react-router';
import { GET_SESSION_BY_ID } from '@/lib/scripts';
import { useFlowQuery } from '@onflow/react-sdk';
import {
	getSessionState,
	isSessionEnded,
	type SessionInfo as SessionInfoType,
} from '@/types/session';
import SessionInfo from '@/components/session/session-info';
import PrizeInfo from '@/components/session/prize-info';
import PurchaseBox from '@/components/session/purchase-box';
import LoadingSession from '@/components/session/loading-session';
import ErrorSession from '@/components/session/error-session';
import StatusBadge from '@/components/session/status-badge';
import ParticipantBox from '@/components/session/participant-box';
import { useEffect, useState } from 'react';
import CloseSession from '@/components/session/close-session';

export default function LotterySessionView() {
	const params = useParams<{ address: string; sessionId: string }>();
	const { address, sessionId } = params;

	const [isTimeRemaining, setIsTimeRemaining] = useState(true);

	const { data, isLoading, error, refetch } = useFlowQuery({
		cadence: GET_SESSION_BY_ID(),
		args: (arg, t) => [arg(address!, t.Address), arg(sessionId!, t.UInt64)],
	}) as {
		data: SessionInfoType | null;
		isLoading: boolean;
		error: Error | null;
		refetch: () => Promise<unknown>;
	};

	useEffect(() => {
		if (!data) return;

		const interval = setInterval(() => {
			const endTime2 = Number(data?.endTime) * 1000;
			const now = Date.now();
			const diff = endTime2 - now;

			if (diff <= 0) {
				setIsTimeRemaining(false);
				clearInterval(interval);
			} else {
				setIsTimeRemaining(true);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [data]);

	if (isLoading) {
		return <LoadingSession />;
	}

	if (error) {
		return <ErrorSession error={error} />;
	}

	// TODO: HANDLE NON-EXISTENT SESSION
	if (!data) {
		return (
			<div style={{ padding: '20px' }}>
				<h2>Session Not Found</h2>
				<p>Session #{sessionId} does not exist or has been removed.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 py-10">
			<div className="flex items-end justify-between mb-5">
				<h1 className="font-bold text-2xl">
					Lotto Session #{data.sessionID}
				</h1>
				<StatusBadge
					endTime={data.endTime}
					startTime={data.createdAt}
					state={getSessionState(data)}
				/>
			</div>

			<SessionInfo
				creator={data.creator}
				endTime={data.endTime}
				participantTickets={data.participantTickets}
				ticketPrice={data.ticketPrice}
			/>

			<PrizeInfo totalPool={data.totalPool} />

			<ParticipantBox participants={data.participantTickets} />

			{isTimeRemaining ? (
				<PurchaseBox
					isEnded={isSessionEnded(data)}
					ticketPrice={data.ticketPrice}
					refetch={refetch}
				/>
			) : (
				<CloseSession
					state={getSessionState(data)}
					winner={data.winner}
					closer={data.closer}
				/>
			)}
		</div>
	);
}
