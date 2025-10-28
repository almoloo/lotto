import { LoaderIcon } from 'lucide-react';

export default function LoadingMySessions() {
	return (
		<div className="flex items-center gap-2">
			<LoaderIcon className="h-6 w-6 animate-spin" />
			<span className="text-slate-500">Loading My Sessions...</span>
		</div>
	);
}
