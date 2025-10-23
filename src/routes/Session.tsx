import { useParams } from 'react-router';
import { GET_SESSION_BY_ID } from '@/lib/scripts';
import { useFlowQuery } from '@onflow/react-sdk';
import type { SessionInfo as SessionInfoType } from '@/types/session';
import SessionInfo from '@/components/session/session-info';
import PrizeInfo from '@/components/session/prize-info';
import PurchaseBox from '@/components/session/purchase-box';
import LoadingSession from '@/components/session/loading-session';
import ErrorSession from '@/components/session/error-session';
import StatusBadge from '@/components/session/status-badge';
import ParticipantBox from '@/components/session/participant-box';

export default function LotterySessionView() {
	const params = useParams<{ address: string; sessionId: string }>();
	const { address, sessionId } = params;

	const { data, isLoading, error } = useFlowQuery({
		cadence: GET_SESSION_BY_ID(),
		args: (arg, t) => [arg(address!, t.Address), arg(sessionId!, t.UInt64)],
	}) as {
		data: SessionInfoType | null;
		isLoading: boolean;
		error: Error | null;
	};

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
					isActive={data.isActive}
					isEnded={data.isEnded}
					endTime={Number(data.endTime)}
				/>
			</div>

			<SessionInfo session={data} />
			<PrizeInfo session={data} />

			{/* Participants List */}
			<ParticipantBox participants={data.participantTickets} />

			<PurchaseBox session={data} />
		</div>
	);
}
