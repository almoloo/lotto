import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { BUY_TICKETS_TX, GET_USER_TICKET_STATUS } from '@/lib/scripts';
import {
	useFlowMutate,
	useFlowQuery,
	useFlowCurrentUser,
} from '@onflow/react-sdk';
import type { SessionInfo, UserTicketStatus } from '@/types/session';
import ConnectButton from '@/components/session/connect-button';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface PurchaseBoxProps {
	session: SessionInfo;
}

export default function PurchaseBox({ session }: PurchaseBoxProps) {
	const params = useParams<{ address: string; sessionId: string }>();
	const { address } = params;

	const { user } = useFlowCurrentUser();
	const userAddress = user?.addr;

	const [numberOfTickets, setNumberOfTickets] = useState(1);
	const [isEnded, setIsEnded] = useState(session.isEnded);

	useEffect(() => {
		const currentTime = Date.now();
		let ended = false;
		if (
			currentTime >= Number(session.endTime) ||
			session.isEnded ||
			!session.isActive
		) {
			ended = true;
		}
		setIsEnded(ended);
	}, [session.endTime, session.isEnded, session.isActive]);

	const {
		data: ticketStatus,
		isLoading: isLoadingTicketStatus,
		error: ticketStatusError,
	} = useFlowQuery({
		cadence: GET_USER_TICKET_STATUS(),
		args: (arg, t) => [
			arg(address!, t.Address),
			arg(userAddress! ?? '', t.Address),
		],
	}) as {
		data: UserTicketStatus | null;
		isLoading: boolean;
		error: Error | null;
	};

	useEffect(() => {
		if (ticketStatus) {
			if (!ticketStatus.canBuyMore) {
				setNumberOfTickets(0);
			} else {
				setNumberOfTickets(Number(ticketStatus.maxAdditionalTickets));
			}
		}
	}, [ticketStatus]);

	const { mutateAsync } = useFlowMutate();

	const handleBuyTickets = async () => {
		try {
			const txId = await mutateAsync({
				cadence: BUY_TICKETS_TX(),
				args: (arg, t) => [
					arg(address!, t.Address),
					arg(numberOfTickets.toString(), t.UInt64),
				],
			});
			console.log('Transaction ID:', txId);
		} catch (err) {
			console.error('Error buying tickets:', err);
		}
	};

	if (isLoadingTicketStatus) {
		return <div>Loading ticket status...</div>;
	}

	if (ticketStatusError) {
		return (
			<div>Error loading ticket status: {ticketStatusError.message}</div>
		);
	}

	return (
		<section className="bg-slate-50 p-5 xl:p-10 rounded-3xl gap-5 flex flex-col">
			<div className="flex flex-col items-start gap-1">
				<h2 className="font-bold">Join the Draw</h2>
				<span className="text-sm text-slate-600">
					{ticketStatus?.currentTickets ?? 0}/3 Tickets Purchased
				</span>
			</div>

			<p>
				Buy up to 3 tickets now for{' '}
				<span className="font-medium">{session.ticketPrice} FLOW </span>
				each. More tickets equals a higher chance to win!
			</p>

			{user?.loggedIn ? (
				<div>
					{/* TODO: REMOVE ! */}
					{!isEnded ? (
						<div className="text-slate-500 text-center border border-dashed border-slate-400 bg-slate-200/25 p-4 rounded-lg">
							This session has ended. Ticket purchases are closed.
						</div>
					) : (
						<div className="flex gap-2">
							{/* TODO: REMOVE ! */}
							{!ticketStatus?.canBuyMore ? (
								<>
									<button
										onClick={handleBuyTickets}
										className="bg-emerald-500 text-white py-3 px-4 rounded-xl w-full cursor-pointer hover:bg-emerald-600 transition-colors"
									>
										Buy {numberOfTickets} Ticket
										{numberOfTickets > 1 ? 's' : ''}
									</button>
									<div className="flex flex-col grow">
										<button
											type="button"
											className="px-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:pointer-events-none flex-1 rounded-t-xl border-b border-slate-300 cursor-pointer"
											onClick={() =>
												setNumberOfTickets(
													Math.min(
														numberOfTickets + 1,
														Number(
															ticketStatus?.maxAdditionalTickets
														)
													)
												)
											}
										>
											<PlusIcon className="size-4" />
										</button>
										<button
											type="button"
											className="px-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:pointer-events-none flex-1 rounded-b-xl cursor-pointer"
										>
											<MinusIcon className="size-4" />
										</button>
									</div>
								</>
							) : (
								<div className="text-slate-500 text-center border border-dashed border-slate-400 bg-slate-200/25 p-4 rounded-lg">
									You have reached the maximum ticket limit.
								</div>
							)}
						</div>
					)}
				</div>
			) : (
				<ConnectButton />
			)}
			{/* <div>
				{ticketStatus?.canBuyMore
					? 'You can buy more tickets!'
					: 'You have reached the maximum ticket limit.'}
			</div> */}
			{/* <div>currentTickets: {ticketStatus?.currentTickets}</div> */}
			{/* <div>
				maxAdditionalTickets: {ticketStatus?.maxAdditionalTickets}
			</div> */}
			{/* {props.isActive && ( //!isExpired && (
				<div style={{ marginTop: '30px' }}>
					<button
						style={{
							width: '100%',
							padding: '15px',
							background: '#4CAF50',
							color: 'white',
							border: 'none',
							borderRadius: '5px',
							fontSize: '18px',
							fontWeight: 'bold',
							cursor: 'pointer',
						}}
						onClick={handleBuyTickets}
						disabled={!ticketStatus?.canBuyMore}
					>
						Buy Tickets ({props.ticketPrice} FLOW each)
					</button>
					<p
						style={{
							textAlign: 'center',
							color: '#666',
							marginTop: '10px',
						}}
					>
						Maximum 3 tickets per wallet
					</p>
				</div>
			)} */}
			{/* {props.isEnded && (
				<div
					style={{
						background: '#ffebee',
						padding: '20px',
						borderRadius: '10px',
						textAlign: 'center',
					}}
				>
					<h3>🏁 This session has ended</h3>
					<p>Winner selection is pending...</p>
				</div>
			)} */}
		</section>
	);
}
