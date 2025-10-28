import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMySessionsProps {
	refetch: () => void;
	error: Error | null;
}

export default function ErrorMySessions({
	refetch,
	error,
}: ErrorMySessionsProps) {
	const errorMessage =
		error && error.message ? error.message : 'Unknown error occurred';

	return (
		<div className="bg-rose-400/10 border border-rose-400/25 border-dashed p-10 rounded-lg text-center flex flex-col items-center gap-2">
			<TriangleAlertIcon className="size-10 text-rose-400 mb-4" />
			<div>
				<p className="text-rose-950 mb-3">{errorMessage}</p>
				<Button
					variant="outline"
					className="cursor-pointer"
					onClick={refetch}
				>
					<RefreshCwIcon className="mr-2 h-5 w-5" />
					Retry Loading
				</Button>
			</div>
		</div>
	);
}
