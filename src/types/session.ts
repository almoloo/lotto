export const SessionState = {
	Active: 0,
	Expired: 1,
	WinnerPicked: 2,
	Completed: 3,
} as const;

export type SessionState = (typeof SessionState)[keyof typeof SessionState];

export interface SessionInfo {
	sessionID: string;
	creator: string;
	ticketPrice: string;
	endTime: string;
	createdAt: string;
	totalPool: string;
	totalTickets: string;
	participantTickets: { [key: string]: string };
	state: { rawValue: string };
	winner: string | null;
	closer: string | null;
	prizesDistributed: boolean;
}

export interface UserTicketStatus {
	currentTickets: string;
	canBuyMore: boolean;
	maxTickets: string;
	remainingTickets: string;
}

export function getSessionState(session: {
	state: { rawValue: string };
}): SessionState {
	return parseInt(session.state.rawValue) as SessionState;
}

export function getSessionStateLabel(session: {
	state: { rawValue: string };
}): string {
	const state = getSessionState(session);
	const labels: Record<number, string> = {
		[SessionState.Active]: 'Active',
		[SessionState.Expired]: 'Expired - Ready to Close',
		[SessionState.WinnerPicked]: 'Winner Selected',
		[SessionState.Completed]: 'Prizes Distributed',
	};
	return labels[state] || 'Unknown';
}

// Helper: Check if session is active (can buy tickets)
export function isSessionActive(session: {
	state: { rawValue: string };
}): boolean {
	return getSessionState(session) === SessionState.Active;
}

// Helper: Check if session has ended
export function isSessionEnded(session: {
	state: { rawValue: string };
}): boolean {
	return getSessionState(session) !== SessionState.Active;
}

// Helper: Get user's ticket count in a session
export function getUserTicketCount(
	session: SessionInfo,
	userAddress: string
): number {
	return parseInt(session.participantTickets[userAddress] || '0');
}

// Helper: Check if user won a session
export function didUserWin(session: SessionInfo, userAddress: string): boolean {
	return (
		session.winner?.toLowerCase() === userAddress.toLowerCase() &&
		session.prizesDistributed
	);
}

// Helper: Calculate total amount spent by user in a session
export function getUserTotalSpent(
	session: SessionInfo,
	userAddress: string
): number {
	const ticketCount = getUserTicketCount(session, userAddress);
	const ticketPrice = parseFloat(session.ticketPrice);
	return ticketCount * ticketPrice;
}

// Interface for user sessions summary
export interface UserSessionsSummary {
	sessions: SessionInfo[];
	totalTicketsPurchased: number;
	totalSpent: number;
	activeSessionsCount: number;
	expiredSessionsCount: number;
	completedSessionsCount: number;
	wonSessionsCount: number;
	totalWinnings: number;
}

// Helper: Create a summary from user's sessions
export function createUserSessionsSummary(
	sessions: SessionInfo[],
	userAddress: string
): UserSessionsSummary {
	const totalTicketsPurchased = sessions.reduce(
		(sum, session) => sum + getUserTicketCount(session, userAddress),
		0
	);

	const totalSpent = sessions.reduce(
		(sum, session) => sum + getUserTotalSpent(session, userAddress),
		0
	);

	const activeSessionsCount = sessions.filter(
		(s) => getSessionState(s) === SessionState.Active
	).length;

	const expiredSessionsCount = sessions.filter(
		(s) => getSessionState(s) === SessionState.Expired
	).length;

	const completedSessionsCount = sessions.filter(
		(s) => getSessionState(s) === SessionState.Completed
	).length;

	const wonSessionsCount = sessions.filter((s) =>
		didUserWin(s, userAddress)
	).length;

	// Calculate total winnings (85% of pool for won sessions)
	const totalWinnings = sessions
		.filter((s) => didUserWin(s, userAddress))
		.reduce(
			(sum, session) => sum + parseFloat(session.totalPool) * 0.85,
			0
		);

	return {
		sessions,
		totalTicketsPurchased,
		totalSpent,
		activeSessionsCount,
		expiredSessionsCount,
		completedSessionsCount,
		wonSessionsCount,
		totalWinnings,
	};
}
