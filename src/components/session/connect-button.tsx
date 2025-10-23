import { useFlowCurrentUser } from '@onflow/react-sdk';

export default function ConnectButton() {
	const { authenticate } = useFlowCurrentUser();

	return (
		<div>
			<button
				onClick={authenticate}
				className="bg-blue-500 text-white py-3 px-4 rounded-xl w-full cursor-pointer hover:bg-blue-600 transition-colors"
			>
				Connect Wallet to Buy Tickets
			</button>
		</div>
	);
}
