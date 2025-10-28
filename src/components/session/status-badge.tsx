import { calculateTimeRemaining } from '@/lib/utils';
import { SessionState } from '@/types/session';
import {
	BatteryFullIcon,
	BatteryLowIcon,
	BatteryMediumIcon,
	BatteryWarningIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusBadgeProps {
	endTime: string;
	startTime: string;
	state: SessionState;
}

export default function StatusBadge({
	endTime,
	startTime,
	state,
}: StatusBadgeProps) {
	const [isEnabled, setIsEnabled] = useState(state === SessionState.Active);
	const [energy, setEnergy] = useState<0 | 1 | 2 | 3>(0);
	const [stateLabel, setStateLabel] = useState<string>('');

	useEffect(() => {
		const remainingTime = calculateTimeRemaining(endTime);
		if (remainingTime) {
			setIsEnabled(state === SessionState.Active);
		} else {
			setIsEnabled(false);
		}
	}, [state, endTime]);

	useEffect(() => {
		if (!isEnabled) {
			setEnergy(0);
			if (state === SessionState.Expired) {
				setStateLabel('Waiting to Close');
			} else if (state === SessionState.Closed) {
				setStateLabel('Ready for Winner Selection');
			} else if (state === SessionState.WinnerPicked) {
				setStateLabel('Winner Picked');
			} else if (state === SessionState.Completed) {
				setStateLabel('Prizes Distributed');
			} else {
				setStateLabel('Ended');
			}
		} else {
			setStateLabel('Active');
			const now = Date.now();
			const totalDuration =
				parseFloat(endTime) * 1000 - parseFloat(startTime) * 1000;
			const timeLeft = parseFloat(endTime) * 1000 - now;
			const percentageLeft = timeLeft / totalDuration;

			if (percentageLeft > 0.66) {
				setEnergy(3);
			} else if (percentageLeft > 0.33) {
				setEnergy(2);
			} else {
				setEnergy(1);
			}
		}
	}, [state, isEnabled, endTime, startTime]);

	const background = isEnabled ? 'bg-emerald-400' : 'bg-gray-500';
	const foreground = 'text-white';

	return (
		<div
			className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${background} ${foreground}`}
		>
			<EnergyIcon energyLevel={energy} />
			{stateLabel}
		</div>
	);
}

function EnergyIcon({ energyLevel }: { energyLevel: number }) {
	if (energyLevel === 0) {
		return <BatteryWarningIcon className="size-4" />;
	} else if (energyLevel === 1) {
		return <BatteryLowIcon className="size-4" />;
	} else if (energyLevel === 2) {
		return <BatteryMediumIcon className="size-4" />;
	} else {
		return <BatteryFullIcon className="size-4" />;
	}
}
