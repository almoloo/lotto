import type { SessionInfo } from '@/types/session';

export default function PrizeInfo({ session }: { session: SessionInfo }) {
	// Calculate prize breakdown
	const totalPool = parseFloat(session.totalPoolAmount);
	const winnerPrize = totalPool * 0.85;
	const creatorFee = totalPool * 0.1;
	const platformFee = totalPool * 0.05;

	return (
		<div>
			PrizeInfo
			<div
				style={{
					background: '#e3f2fd',
					padding: '20px',
					borderRadius: '10px',
					marginBottom: '20px',
				}}
			>
				<h2 style={{ marginTop: 0 }}>Prize Pool</h2>

				<div
					style={{
						fontSize: '32px',
						fontWeight: 'bold',
						marginBottom: '15px',
					}}
				>
					{session.totalPoolAmount} FLOW
				</div>

				<div style={{ marginBottom: '10px' }}>
					<strong>Tickets Sold:</strong> {session.ticketsSold}
				</div>

				<div style={{ marginBottom: '10px' }}>
					<strong>Participants:</strong> {session.participantCount}
				</div>

				<div
					style={{
						marginTop: '15px',
						paddingTop: '15px',
						borderTop: '1px solid #90caf9',
					}}
				>
					<div>
						Winner receives:{' '}
						<strong>{winnerPrize.toFixed(2)} FLOW</strong> (85%)
					</div>
					<div>
						Creator receives:{' '}
						<strong>{creatorFee.toFixed(2)} FLOW</strong> (10%)
					</div>
					<div>
						Platform fee:{' '}
						<strong>{platformFee.toFixed(2)} FLOW</strong> (5%)
					</div>
				</div>
			</div>
		</div>
	);
}
