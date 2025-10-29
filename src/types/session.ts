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
	scheduledWinnerSelectionTime: string;
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
		[SessionState.Expired]: 'Awaiting Automatic Winner Selection',
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
