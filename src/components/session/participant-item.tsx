export default function ParticipantItem({
	address,
	tickets,
}: {
	address: string;
	tickets: number;
}) {
	return (
		<div
			key={address}
			style={{
				padding: '10px',
				marginBottom: '5px',
				background: 'white',
				borderRadius: '5px',
				display: 'flex',
				justifyContent: 'space-between',
			}}
		>
			<span
				style={{
					fontFamily: 'monospace',
					fontSize: '14px',
				}}
			>
				{address}
			</span>
			<span style={{ fontWeight: 'bold' }}>
				{tickets} ticket
				{tickets > 1 ? 's' : ''}
			</span>
		</div>
	);
}
