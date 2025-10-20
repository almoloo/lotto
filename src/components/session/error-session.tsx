// TODO: CREATE ERROR HANDLING

export default function ErrorSession({ error }: { error: Error }) {
	return (
		<div style={{ padding: '20px' }}>
			<h2>Error Loading Session</h2>
			<p style={{ color: 'red' }}>{error.message}</p>
			{/* <button onClick={refetch}>Retry</button> */}
		</div>
	);
}
