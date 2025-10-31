import { CLOSE_SESSION_TRANSACTION } from '@/lib/scripts';
import { SessionState } from '@/types/session';
import { useFlowMutate } from '@onflow/react-sdk';
import { LoaderIcon } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

interface CloseSessionProps {
	state: SessionState;
	winner?: string | null;
	closer?: string | null;
}

export default function CloseSession({
	state,
	winner,
	closer,
}: CloseSessionProps) {
	const params = useParams<{ address: string; sessionId: string }>();
	const { address, sessionId } = params;
	const { mutateAsync } = useFlowMutate();
	const [pendingClosure, setPendingClosure] = useState(false);

	if (
		state === SessionState.WinnerPicked ||
		state === SessionState.Completed
	) {
		return (
			<section className="bg-emerald-50 border border-emerald-200 p-5 xl:p-10 rounded-3xl gap-5 flex flex-col">
				<div className="flex flex-col items-start gap-1">
					<h2 className="font-bold">This session has been closed</h2>
					<span className="text-sm text-slate-600">
						The winner and closer details are as follows:
					</span>
				</div>
				<div className="mt-1 space-y-2">
					<h3>Winner: {winner}</h3>
					<h3>Closer: {closer}</h3>
				</div>
			</section>
		);
	}

	const handleCloseSession = async () => {
		setPendingClosure(true);
		try {
			const txId = await mutateAsync({
				cadence: CLOSE_SESSION_TRANSACTION(),
				args: (arg, t) => [
					arg(address!, t.Address),
					arg(sessionId!, t.UInt64),
				],
			});
			console.log('Transaction ID:', txId);
			toast.success(
				`Successfully closed the session and claimed your reward!`
			);
		} catch (error) {
			console.error('Error closing session:', error);
			toast.error('Failed to close the session. Please try again.');
		} finally {
			setPendingClosure(false);
		}
	};

	return (
		<section className="bg-emerald-50 border border-emerald-200 p-5 xl:p-10 rounded-3xl gap-5 flex flex-col">
			<div className="flex flex-col items-start gap-1">
				<h2 className="font-bold">Close This Session</h2>
				<span className="text-sm text-slate-600">
					And get 2.5% of the total pool as a reward for closing it.
				</span>
			</div>

			<div>
				<button
					className="bg-emerald-500 text-white py-3 px-4 rounded-xl w-full cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
					disabled={pendingClosure}
					onClick={handleCloseSession}
				>
					{pendingClosure ? (
						<LoaderIcon className="size-5 animate-spin mx-auto" />
					) : (
						`Close Session`
					)}
				</button>
			</div>
		</section>
	);
}
