import { useParams } from 'react-router';
import { GET_SESSION_BY_ID } from '@/lib/scripts';
import { useFlowQuery } from '@onflow/react-sdk';
import type { SessionInfo as SessionInfoType } from '@/types/session';
import SessionInfo from '@/components/session/session-info';
import PrizeInfo from '@/components/session/prize-info';
import ParticipantItem from '@/components/session/participant-item';
import PurchaseBox from '@/components/session/purchase-box';
import LoadingSession from '@/components/session/loading-session';
import ErrorSession from '@/components/session/error-session';

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
		<div>
			<h1>Lottery Session #{data.sessionID}</h1>

			<SessionInfo session={data} />
			<PrizeInfo session={data} />

			{/* Participants List */}
			{Object.keys(data.participantTickets).length > 0 && (
				<div
					style={{
						background: '#fff3e0',
						padding: '20px',
						borderRadius: '10px',
						marginBottom: '20px',
					}}
				>
					<h2 style={{ marginTop: 0 }}>
						Participants ({data.participantCount})
					</h2>

					<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
						{Object.entries(data.participantTickets).map(
							([address, tickets]) => (
								<ParticipantItem
									address={address}
									tickets={Number(tickets)}
									key={address}
								/>
							)
						)}
					</div>
				</div>
			)}

			<PurchaseBox
				isActive={data.isActive}
				isEnded={data.isEnded}
				ticketPrice={data.ticketPrice}
			/>
		</div>
	);
}
