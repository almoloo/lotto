import { useFlowCurrentUser, useFlowQuery } from '@onflow/react-sdk';
import { GET_ALL_SESSIONS } from '../lib/scripts';
import { useEffect } from 'react';
import type { SessionInfo } from '../types/session';
import SessionListItem from '@/components/mysessions/session-list-item';
import SessionListEmptyState from '@/components/mysessions/empty-state';
import ErrorMySessions from '@/components/mysessions/error';
import LoadingMySessions from '@/components/mysessions/loading';

export default function MySessionsView() {
	const { user } = useFlowCurrentUser();

	const { data, isPending, error, refetch } = useFlowQuery({
		cadence: GET_ALL_SESSIONS(),
		args: (arg, t) => [arg(user?.addr ?? '', t.Address)],
	}) as {
		data: SessionInfo[] | null;
		isPending: boolean;
		error: Error | null;
		refetch: () => void;
	};

	useEffect(() => {
		if (data) {
			console.log('Fetched sessions:', data);
		}
	}, [data]);

	return (
		<div className="flex flex-col gap-6 py-10">
			<h1 className="font-bold text-2xl">My Sessions</h1>

			<div className="flex flex-col gap-3">
				{isPending ? (
					<LoadingMySessions />
				) : (
					<>
						{error ? (
							<ErrorMySessions
								refetch={refetch}
								error={error}
							/>
						) : (
							<>
								{!data || data.length === 0 ? (
									<SessionListEmptyState />
								) : (
									data.map((session) => (
										<SessionListItem
											key={session.sessionID.toString()}
											session={session}
										/>
									))
								)}
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}
