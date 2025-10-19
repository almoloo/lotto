import { useParams } from 'react-router';

export default function LotterySessionView() {
	const params = useParams();

	return <div>Lottery Session: {params.sessionId}</div>;
}
