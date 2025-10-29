import { NavLink, useParams } from 'react-router';
import { useFlowQuery } from '@onflow/react-sdk';
import { GET_ALL_SESSIONS } from '../lib/scripts';
import { useEffect } from 'react';
import type { SessionInfo } from '../types/session';
import { isSessionActive } from '../types/session';

export default function UserProfileView() {
	const { address } = useParams<{ address: string }>();
	const { data, isLoading, error } = useFlowQuery({
		cadence: GET_ALL_SESSIONS(),
		args: (arg, t) => [arg(address!, t.Address)],
	}) as {
		data: SessionInfo[] | null;
		isLoading: boolean;
		error: Error | null;
	};

	useEffect(() => {
		if (data) {
			console.log('Fetched sessions:', data);
		}
	}, [data]);

	// TODO: CREATE LOADING
	if (isLoading) {
		return <div>Loading sessions...</div>;
	}

	// TODO: CREATE ERROR HANDLING
	if (error) {
		return (
			<div>
				<p>Error loading sessions: {error.message}</p>
				{/* <button onClick={refetch}>Retry</button> */}
			</div>
		);
	}

	// TODO: CREATE EMPTY STATE
	if (!data || data.length === 0) {
		return (
			<div>
				<h2>User Profile: {address}</h2>
				<p>No sessions found for this address.</p>
			</div>
		);
	}

	// TODO: CREATE SESSION LISTING UI
	return (
		<div className="flex flex-col gap-6 py-10">
			<h2>User Profile: {address}</h2>
			<p>Total Sessions: {data.length}</p>

			<div>
				<h3>All Sessions</h3>
				{data.map((session) => (
					<div
						key={session.sessionID}
						style={{
							border: '1px solid #ccc',
							padding: '10px',
							margin: '10px 0',
						}}
					>
						<h4>Session #{session.sessionID}</h4>
						<p>Ticket Price: {session.ticketPrice} FLOW</p>
						<p>
							End Time:{' '}
							{new Date(
								parseFloat(session.endTime) * 1000
							).toLocaleString()}
						</p>
						<p>
							Status:{' '}
							{isSessionActive(session)
								? '🟢 Active'
								: '⚪ Ended'}
						</p>
						<p>Total Pool: {session.totalPool} FLOW</p>
						<p>Tickets Sold: {session.totalTickets}</p>
						<p>
							Participants:{' '}
							{Object.keys(session.participantTickets).length}
						</p>
						<NavLink
							to={`/session/${session.creator}/${session.sessionID}`}
							className="text-blue-500 underline"
						>
							View Session Details
						</NavLink>
					</div>
				))}
			</div>
		</div>
	);
}
