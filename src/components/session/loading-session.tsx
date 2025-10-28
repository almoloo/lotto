import { LoaderIcon } from 'lucide-react';

export default function LoadingSession() {
	return (
		<div className="flex items-center gap-2 my-10">
			<LoaderIcon className="h-6 w-6 animate-spin" />
			<span className="text-slate-500">Loading Session Info...</span>
		</div>
	);
}
