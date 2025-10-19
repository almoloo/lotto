import { useState } from 'react';
import { CREATE_SESSION_TX } from '../lib/scripts';
import { useFlowMutate } from '@onflow/react-sdk';

export default function CreateLottoView() {
	const { mutateAsync, isPending, error } = useFlowMutate();

	const [ticketPrice, setTicketPrice] = useState('1.0');
	const [duration, setDuration] = useState('86400');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const currentTime = Math.floor(Date.now() / 1000);
			const endTime = currentTime + parseInt(duration);

			const txId = await mutateAsync({
				cadence: CREATE_SESSION_TX(),
				args: (arg, t) => [
					arg(parseFloat(ticketPrice).toFixed(1), t.UFix64),
					arg(endTime.toFixed(1), t.UFix64),
				],
			});
			console.log('Transaction submitted with ID:', txId);
			// Optionally, redirect to the session page or show success message
		} catch (err) {
			console.error('Error creating session:', err);
		}
	};

	return (
		<div>
			<h1>CREATE LOTTERY SESSION</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label
						htmlFor="ticketPrice"
						style={{ display: 'block', marginBottom: '5px' }}
					>
						Ticket Price (FLOW) *
					</label>
					<input
						id="ticketPrice"
						type="number"
						step="0.1"
						min="0.1"
						value={ticketPrice}
						onChange={(e) => setTicketPrice(e.target.value)}
						placeholder="1.0"
						required
						style={{ width: '100%', padding: '8px' }}
					/>
					<small style={{ color: '#666' }}>
						Price per ticket (min: 0.1 FLOW)
					</small>
				</div>

				<div style={{ marginBottom: '20px' }}>
					<label
						htmlFor="duration"
						style={{ display: 'block', marginBottom: '5px' }}
					>
						Session Duration *
					</label>
					<select
						id="duration"
						value={duration}
						onChange={(e) => setDuration(e.target.value)}
						required
						style={{ width: '100%', padding: '8px' }}
					>
						<option value="3600">1 Hour</option>
						<option value="21600">6 Hours</option>
						<option value="86400">1 Day</option>
						<option value="259200">3 Days</option>
						<option value="604800">1 Week</option>
						<option value="2592000">30 Days</option>
					</select>
					<small style={{ color: '#666' }}>
						Session ends:{' '}
						{new Date(
							Date.now() + parseInt(duration) * 1000
						).toLocaleString()}
					</small>
				</div>

				{error && (
					<div
						style={{
							background: '#ffebee',
							color: '#c62828',
							padding: '10px',
							borderRadius: '5px',
							marginBottom: '20px',
						}}
					>
						Error: {error.message}
					</div>
				)}

				<button
					type="submit"
					disabled={isPending}
					style={{
						width: '100%',
						padding: '12px',
						background: isPending ? '#ccc' : '#4CAF50',
						color: 'white',
						border: 'none',
						borderRadius: '5px',
						fontSize: '16px',
						cursor: isPending ? 'not-allowed' : 'pointer',
					}}
				>
					{isPending ? 'Creating Session...' : 'Create Session'}
				</button>
			</form>
		</div>
	);
}
