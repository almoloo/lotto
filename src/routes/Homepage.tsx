import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	TicketIcon,
	TrophyIcon,
	ShieldCheckIcon,
	ClockIcon,
	CoinsIcon,
	UsersIcon,
	SparklesIcon,
	ArrowRightIcon,
	CircleDollarSignIcon,
	LockIcon,
	InfoIcon,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { useFlowCurrentUser } from '@onflow/react-sdk';

export default function HomepageView() {
	const { user } = useFlowCurrentUser();

	return (
		<div className="flex flex-col gap-12 py-10">
			{/* Hero Section */}
			<section className="flex flex-col gap-6 items-center text-center py-8">
				<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
					<SparklesIcon className="h-4 w-4" />
					<span>Powered by Flow Blockchain</span>
				</div>

				<h1 className="font-bold text-5xl max-w-3xl leading-tight">
					Decentralized Lottery on{' '}
					<span className="text-primary">Flow</span>
				</h1>

				<p className="text-lg text-muted-foreground max-w-2xl">
					Experience fair, transparent, and secure lottery sessions
					powered by blockchain technology. Create sessions, buy
					tickets, and win prizes—all on-chain.
				</p>

				<div className="flex gap-4 mt-4">
					{user ? (
						<>
							<NavLink to="/create">
								<Button
									size="lg"
									className="gap-2"
								>
									<TicketIcon className="h-5 w-5" />
									Create Session
								</Button>
							</NavLink>
							<NavLink to="/mysessions">
								<Button
									size="lg"
									variant="outline"
									className="gap-2"
								>
									My Sessions
									<ArrowRightIcon className="h-4 w-4" />
								</Button>
							</NavLink>
						</>
					) : (
						<Alert className="max-w-md">
							<InfoIcon className="h-4 w-4" />
							<AlertTitle>Connect Your Wallet</AlertTitle>
							<AlertDescription>
								Please connect your wallet to create sessions
								and participate in the lottery.
							</AlertDescription>
						</Alert>
					)}
				</div>
			</section>

			{/* How It Works */}
			<section className="flex flex-col gap-6">
				<div className="text-center">
					<h2 className="font-bold text-3xl mb-3">How It Works</h2>
					<p className="text-muted-foreground">
						Simple steps to participate in decentralized lottery
						sessions
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
					<div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
						<div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
							<span className="font-bold text-lg">1</span>
						</div>
						<h3 className="font-bold text-xl">Create or Join</h3>
						<p className="text-muted-foreground">
							Anyone can create a lottery session by setting a
							ticket price and end time, or join existing sessions
							by purchasing tickets.
						</p>
					</div>

					<div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
						<div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
							<span className="font-bold text-lg">2</span>
						</div>
						<h3 className="font-bold text-xl">Buy Tickets</h3>
						<p className="text-muted-foreground">
							Purchase tickets with FLOW tokens. More tickets
							increase your chances of winning. Each session has a
							maximum ticket limit per wallet.
						</p>
					</div>

					<div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
						<div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
							<span className="font-bold text-lg">3</span>
						</div>
						<h3 className="font-bold text-xl">Win Prizes</h3>
						<p className="text-muted-foreground">
							When the session ends, a winner is randomly selected
							using provably fair blockchain randomness. Prizes
							are distributed automatically.
						</p>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="flex flex-col gap-6">
				<div className="text-center">
					<h2 className="font-bold text-3xl mb-3">Key Features</h2>
					<p className="text-muted-foreground">
						Why choose our decentralized lottery platform
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
					<div className="flex gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
						<div className="flex-shrink-0">
							<ShieldCheckIcon className="h-8 w-8 text-primary" />
						</div>
						<div className="flex flex-col gap-2">
							<h3 className="font-bold text-lg">Provably Fair</h3>
							<p className="text-sm text-muted-foreground">
								Uses Flow's on-chain randomness for transparent
								and verifiable winner selection.
							</p>
						</div>
					</div>

					<div className="flex gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
						<div className="flex-shrink-0">
							<LockIcon className="h-8 w-8 text-primary" />
						</div>
						<div className="flex flex-col gap-2">
							<h3 className="font-bold text-lg">
								Secure & Transparent
							</h3>
							<p className="text-sm text-muted-foreground">
								All transactions and sessions are recorded on
								the Flow blockchain for complete transparency.
							</p>
						</div>
					</div>

					<div className="flex gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
						<div className="flex-shrink-0">
							<ClockIcon className="h-8 w-8 text-primary" />
						</div>
						<div className="flex flex-col gap-2">
							<h3 className="font-bold text-lg">
								Time-Based Sessions
							</h3>
							<p className="text-sm text-muted-foreground">
								Each session has a defined end time. Winners are
								automatically selected when sessions close.
							</p>
						</div>
					</div>

					<div className="flex gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
						<div className="flex-shrink-0">
							<CircleDollarSignIcon className="h-8 w-8 text-primary" />
						</div>
						<div className="flex flex-col gap-2">
							<h3 className="font-bold text-lg">
								Fair Distribution
							</h3>
							<p className="text-sm text-muted-foreground">
								85% to winner, 10% to creator, 2.5% to platform,
								and 2.5% to the closer who finalizes the
								session.
							</p>
						</div>
					</div>

					<div className="flex gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
						<div className="flex-shrink-0">
							<UsersIcon className="h-8 w-8 text-primary" />
						</div>
						<div className="flex flex-col gap-2">
							<h3 className="font-bold text-lg">
								Community Driven
							</h3>
							<p className="text-sm text-muted-foreground">
								Anyone can create sessions and participate.
								Build your own lottery community.
							</p>
						</div>
					</div>

					<div className="flex gap-4 p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
						<div className="flex-shrink-0">
							<CoinsIcon className="h-8 w-8 text-primary" />
						</div>
						<div className="flex flex-col gap-2">
							<h3 className="font-bold text-lg">
								FLOW Token Based
							</h3>
							<p className="text-sm text-muted-foreground">
								All transactions use FLOW tokens, ensuring fast
								and low-cost participation.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Prize Distribution Info */}
			<section className="flex flex-col gap-6">
				<div className="text-center">
					<h2 className="font-bold text-3xl mb-3">
						Prize Distribution
					</h2>
					<p className="text-muted-foreground">
						Understanding how winnings are distributed
					</p>
				</div>

				<div className="max-w-3xl mx-auto w-full">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="flex flex-col gap-3 p-8 border-2 border-primary rounded-lg bg-primary/5">
							<div className="flex items-center gap-3">
								<TrophyIcon className="h-10 w-10 text-primary" />
								<div>
									<p className="text-3xl font-bold text-primary">
										85%
									</p>
									<p className="text-sm text-muted-foreground">
										Winner Prize
									</p>
								</div>
							</div>
							<p className="text-sm">
								The largest share goes to the lucky winner,
								ensuring a substantial reward.
							</p>
						</div>

						<div className="flex flex-col gap-3 p-6 border rounded-lg bg-card">
							<div className="flex items-center gap-3">
								<UsersIcon className="h-8 w-8 text-primary" />
								<div>
									<p className="text-2xl font-bold">10%</p>
									<p className="text-sm text-muted-foreground">
										Session Creator
									</p>
								</div>
							</div>
							<p className="text-sm text-muted-foreground">
								Rewards the creator for organizing the session.
							</p>
						</div>

						<div className="flex flex-col gap-3 p-6 border rounded-lg bg-card">
							<div className="flex items-center gap-3">
								<ShieldCheckIcon className="h-8 w-8 text-primary" />
								<div>
									<p className="text-2xl font-bold">2.5%</p>
									<p className="text-sm text-muted-foreground">
										Platform Fee
									</p>
								</div>
							</div>
							<p className="text-sm text-muted-foreground">
								Supports platform maintenance and development.
							</p>
						</div>

						<div className="flex flex-col gap-3 p-6 border rounded-lg bg-card">
							<div className="flex items-center gap-3">
								<ClockIcon className="h-8 w-8 text-primary" />
								<div>
									<p className="text-2xl font-bold">2.5%</p>
									<p className="text-sm text-muted-foreground">
										Session Closer
									</p>
								</div>
							</div>
							<p className="text-sm text-muted-foreground">
								Incentivizes users to finalize expired sessions.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="flex flex-col gap-6 items-center text-center p-12 bg-primary/5 rounded-2xl border-2 border-primary/20">
				<h2 className="font-bold text-3xl max-w-2xl">
					Ready to Try Your Luck?
				</h2>
				<p className="text-muted-foreground max-w-xl">
					Join the decentralized lottery revolution. Create your own
					session or participate in existing ones. Fair, transparent,
					and secure.
				</p>
				{user ? (
					<div className="flex gap-4">
						<NavLink to="/create">
							<Button
								size="lg"
								className="gap-2"
							>
								<TicketIcon className="h-5 w-5" />
								Create Your Session
							</Button>
						</NavLink>
						<NavLink to="/mysessions">
							<Button
								size="lg"
								variant="outline"
							>
								View My Sessions
							</Button>
						</NavLink>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						Connect your wallet in the header to get started
					</p>
				)}
			</section>
		</div>
	);
}
