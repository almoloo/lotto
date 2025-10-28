import { NavLink } from 'react-router';
import { Button } from '@/components/ui/button';
import { CalendarPlusIcon } from 'lucide-react';

export default function SessionListEmptyState() {
	return (
		<div>
			<div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg gap-5">
				<p className="text-gray-500">
					You have no Lotto sessions yet. Create one to get started!
				</p>
				<Button
					variant="link"
					size="lg"
					asChild
				>
					<NavLink
						to="/create"
						className=""
					>
						<CalendarPlusIcon className="mr-2 h-5 w-5" />
						Create Session
					</NavLink>
				</Button>
			</div>
		</div>
	);
}
