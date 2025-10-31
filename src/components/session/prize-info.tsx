import { useEffect, useState } from 'react';

interface PrizeInfoProps {
	totalPool: string;
}

export default function PrizeInfo({ totalPool }: PrizeInfoProps) {
	const [winnerPrize, setWinnerPrize] = useState<number>(0);
	const [creatorFee, setCreatorFee] = useState<number>(0);
	const [platformFee, setPlatformFee] = useState<number>(0);
	const [closerPrize, setCloserPrize] = useState<number>(0);

	useEffect(() => {
		setWinnerPrize(parseFloat(totalPool) * 0.85);
		setCreatorFee(parseFloat(totalPool) * 0.1);
		setPlatformFee(parseFloat(totalPool) * 0.025);
		setCloserPrize(parseFloat(totalPool) * 0.025);
	}, [totalPool]);

	return (
		<section className="bg-slate-100 p-5 xl:p-10 rounded-3xl">
			<div className="space-y-5">
				<h2 className="font-bold">Prize Distribution</h2>
				<div className="flex gap-2">
					<div
						className="bg-emerald-400 h-4 rounded"
						style={{ width: '85%' }}
					></div>
					<div
						className="bg-rose-400 h-4 rounded"
						style={{ width: '10%' }}
					></div>
					<div
						className="bg-sky-400 h-4 rounded"
						style={{ width: '2.5%' }}
					></div>
					<div
						className="bg-purple-400 h-4 rounded"
						style={{ width: '2.5%' }}
					></div>
				</div>

				<div className="space-y-2 text-sm">
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 bg-emerald-400 rounded"></div>
						<span>Winner receives</span>
						<div className="grow border-b border-dashed border-slate-300"></div>
						<strong>
							<small className="font-normal">(85%) </small>
							{winnerPrize.toFixed(2)} FLOW
						</strong>
					</div>

					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 bg-rose-400 rounded"></div>
							<span>Creator receives</span>
							<div className="grow border-b border-dashed border-slate-300"></div>
							<strong>
								<small className="font-normal">(10%) </small>
								{creatorFee.toFixed(2)} FLOW{' '}
							</strong>
						</div>

						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 bg-sky-400 rounded"></div>
								<span>Platform receives</span>
								<div className="grow border-b border-dashed border-slate-300"></div>
								<strong>
									<small className="font-normal">
										(2.5%){' '}
									</small>
									{platformFee.toFixed(2)} FLOW
								</strong>
							</div>
						</div>

						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 bg-purple-400 rounded"></div>
								<span>Closer receives</span>
								<div className="grow border-b border-dashed border-slate-300"></div>
								<strong>
									<small className="font-normal">
										(2.5%){' '}
									</small>
									{closerPrize.toFixed(2)} FLOW
								</strong>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
