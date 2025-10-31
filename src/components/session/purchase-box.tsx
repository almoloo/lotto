import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { BUY_TICKETS_TX, GET_USER_TICKET_STATUS } from '@/lib/scripts';
import {
	useFlowMutate,
	useFlowQuery,
	useFlowCurrentUser,
} from '@onflow/react-sdk';
import type { UserTicketStatus } from '@/types/session';
import ConnectButton from '@/components/session/connect-button';
import { LoaderIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface PurchaseBoxProps {
	isEnded: boolean;
	ticketPrice: string;
	refetch: () => Promise<unknown>;
}

export default function PurchaseBox({
	isEnded,
	ticketPrice,
	refetch,
}: PurchaseBoxProps) {
	const params = useParams<{ address: string; sessionId: string }>();
	const { address } = params;

	const { user } = useFlowCurrentUser();
	const userAddress = user?.addr;

	const [numberOfTickets, setNumberOfTickets] = useState(1);
	const [pendingPurchase, setPendingPurchase] = useState(false);

	const {
		data: ticketStatus,
		isLoading: isLoadingTicketStatus,
		error: ticketStatusError,
		refetch: refetchTicketStatus,
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
		refetch: () => Promise<unknown>;
	};

	useEffect(() => {
		if (ticketStatus) {
			if (!ticketStatus.canBuyMore) {
				setNumberOfTickets(0);
			} else {
				setNumberOfTickets(Number(ticketStatus.remainingTickets));
			}
		}
	}, [ticketStatus]);

	const { mutateAsync } = useFlowMutate();

	const handleBuyTickets = async () => {
		setPendingPurchase(true);
		try {
			const txId = await mutateAsync({
				cadence: BUY_TICKETS_TX(),
				args: (arg, t) => [
					arg(address!, t.Address),
					arg(numberOfTickets.toString(), t.UInt64),
				],
			});
			console.log('Transaction ID:', txId);
			toast.success(
				`Successfully purchased ${numberOfTickets} ticket${
					numberOfTickets > 1 ? 's' : ''
				}.`
			);
			setNumberOfTickets(1);
			await refetchTicketStatus();
			await refetch();
		} catch (err) {
			console.error('Error buying tickets:', err);
		} finally {
			setPendingPurchase(false);
		}
	};

	function handleMinusTicket() {
		setNumberOfTickets(Math.max(1, numberOfTickets - 1));
	}

	function handlePlusTicket() {
		if (ticketStatus) {
			setNumberOfTickets(
				Math.min(
					numberOfTickets + 1,
					Number(ticketStatus.remainingTickets)
				)
			);
		}
	}

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
					{ticketStatus?.currentTickets}/3 Tickets Purchased
				</span>
			</div>

			<p>
				Buy up to {ticketStatus?.remainingTickets} tickets now for{' '}
				<span className="font-medium font-mono text-emerald-700">
					{parseFloat(ticketPrice)} FLOW{' '}
				</span>
				each. More tickets equals a higher chance to win!
			</p>

			{user?.loggedIn ? (
				<div>
					{isEnded ? (
						<div className="text-slate-500 text-center border border-dashed border-slate-400 bg-slate-200/25 p-4 rounded-lg">
							This session has ended. Ticket purchases are closed.
						</div>
					) : (
						<div className="flex flex-row gap-2">
							{ticketStatus?.canBuyMore ? (
								<>
									<button
										onClick={handleBuyTickets}
										className="bg-emerald-500 text-white py-3 px-4 rounded-xl w-full cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:pointer-events-none"
										disabled={pendingPurchase}
									>
										{pendingPurchase ? (
											<LoaderIcon className="size-5 animate-spin mx-auto" />
										) : (
											`Buy ${numberOfTickets} Ticket${
												numberOfTickets > 1 ? 's' : ''
											}`
										)}
									</button>
									<div className="flex flex-col grow">
										<Button
											type="button"
											size="icon-sm"
											variant="outline"
											className="rounded-b-none cursor-pointer"
											onClick={handlePlusTicket}
											disabled={
												pendingPurchase ||
												!ticketStatus ||
												numberOfTickets >=
													Number(
														ticketStatus.remainingTickets
													)
											}
										>
											<PlusIcon className="size-4" />
										</Button>
										<Button
											type="button"
											size="icon-sm"
											variant="outline"
											className="rounded-t-none cursor-pointer"
											// className="px-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:pointer-events-none grow rounded-b-xl cursor-pointer"
											onClick={handleMinusTicket}
											disabled={
												pendingPurchase ||
												!ticketStatus ||
												numberOfTickets <= 1
											}
										>
											<MinusIcon className="size-4" />
										</Button>
									</div>
								</>
							) : (
								<div className="w-full text-slate-500 text-center border border-dashed border-slate-400 bg-slate-200/25 p-4 rounded-lg">
									You have reached the maximum ticket limit.
								</div>
							)}
						</div>
					)}
				</div>
			) : (
				<ConnectButton />
			)}
		</section>
	);
}
