import type { SessionInfo } from '@/types/session';

export default function SessionInfo({ session }: { session: SessionInfo }) {
	// Calculate time remaining
	const endTime = parseFloat(session.endTime) * 1000;
	const now = Date.now();
	const timeRemaining = endTime - now;
	// const isExpired = timeRemaining <= 0;

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
		<div>
			<div
				style={{
					display: 'inline-block',
					padding: '5px 15px',
					borderRadius: '20px',
					background: session.isActive ? '#4CAF50' : '#757575',
					color: 'white',
					fontSize: '14px',
					fontWeight: 'bold',
				}}
			>
				{session.isActive ? '🟢 Active' : '⚪ Ended'}
			</div>

			<div
				style={{
					background: '#f5f5f5',
					padding: '20px',
					borderRadius: '10px',
					marginBottom: '20px',
				}}
			>
				<h2 style={{ marginTop: 0 }}>Session Details</h2>

				<div style={{ marginBottom: '10px' }}>
					<strong>Creator:</strong> {session.creator}
				</div>

				<div style={{ marginBottom: '10px' }}>
					<strong>Ticket Price:</strong> {session.ticketPrice} FLOW
				</div>

				<div style={{ marginBottom: '10px' }}>
					<strong>End Time:</strong>{' '}
					{new Date(endTime).toLocaleString()}
				</div>

				<div style={{ marginBottom: '10px' }}>
					<strong>Time Remaining:</strong>{' '}
					{formatTimeRemaining(timeRemaining)}
				</div>
			</div>
		</div>
	);
}
