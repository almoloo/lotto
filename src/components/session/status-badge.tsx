import { calculateTimeRemaining } from '@/lib/utils';
import {
	BatteryFullIcon,
	BatteryLowIcon,
	BatteryMediumIcon,
	BatteryWarningIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusBadgeProps {
	isActive: boolean;
	isEnded: boolean;
	endTime: string;
	startTime: string;
}

export default function StatusBadge({
	isActive,
	isEnded,
	endTime,
	startTime,
}: StatusBadgeProps) {
	const [isEnabled, setIsEnabled] = useState(isActive);
	const [energy, setEnergy] = useState<0 | 1 | 2 | 3>(0);

	useEffect(() => {
		const remainingTime = calculateTimeRemaining(endTime);
		if (remainingTime) {
			setIsEnabled(isActive && !isEnded);
		} else {
			setIsEnabled(false);
		}
	}, [isActive, endTime, isEnded]);

	useEffect(() => {
		if (!isEnabled) {
			setEnergy(0);
		} else {
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
	}, [isEnabled, endTime, startTime]);

	const background = isEnabled ? 'bg-emerald-400' : 'bg-gray-500';
	const foreground = 'text-white';
	const label = isEnabled ? 'Active' : 'Ended';

	return (
		<div
			className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${background} ${foreground}`}
		>
			<EnergyIcon energyLevel={energy} />
			{label}
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
