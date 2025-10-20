import { useParams } from 'react-router';
import { useState } from 'react';
import { BUY_TICKETS_TX, GET_USER_TICKET_STATUS } from '@/lib/scripts';
import {
	useFlowMutate,
	useFlowQuery,
	useFlowCurrentUser,
} from '@onflow/react-sdk';
import type { UserTicketStatus } from '@/types/session';

interface PurchaseBoxProps {
	isActive: boolean;
	isEnded: boolean;
	ticketPrice: string;
}

export default function PurchaseBox(props: PurchaseBoxProps) {
	const params = useParams<{ address: string; sessionId: string }>();
	const { address, sessionId } = params;

	const currentUser = useFlowCurrentUser();
	const userAddress = currentUser?.user?.addr;

	const [numberOfTickets, setNumberOfTickets] = useState(1);

	// const { data: ticketStatus, isLoading: isLoadingTicketStatus } =		useFlowQueryClient({
	// 		cadence: GET_USER_TICKET_STATUS(),
	// 		args: (arg, t) => [
	// 			arg(address!, t.Address),
	// 			arg(userAddress!, t.Address),
	// 		],
	// 		enabled: !!userAddress,
	//   })

	const { data: ticketStatus, isLoading: isLoadingTicketStatus } =
		useFlowQuery({
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

	const { mutateAsync, isPending, error } = useFlowMutate();

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

	return (
		<div>
			PurchaseBox
			<div>address: {address}</div>
			<div>sessionId: {sessionId}</div>
			<div>
				{ticketStatus?.canBuyMore
					? 'You can buy more tickets!'
					: 'You have reached the maximum ticket limit.'}
			</div>
			<div>currentTickets: {ticketStatus?.currentTickets}</div>
			<div>
				maxAdditionalTickets: {ticketStatus?.maxAdditionalTickets}
			</div>
			{props.isActive && ( //!isExpired && (
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
			)}
			{props.isEnded && (
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
			)}
		</div>
	);
}
