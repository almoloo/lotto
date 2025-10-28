export const SessionState = {
	Active: 0,
	Expired: 1,
	Closed: 2,
	WinnerPicked: 3,
	Completed: 4,
} as const;

export type SessionState = (typeof SessionState)[keyof typeof SessionState];

export interface SessionInfo {
	sessionID: string;
	creator: string;
	ticketPrice: string;
	endTime: string;
	createdAt: string;
	isEnded: boolean;
	totalPool: string;
	totalTickets: string;
	isActive: boolean;
	participantTickets: { [key: string]: string };
	state: { rawValue: string };
	winner: string | null;
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
	const labels = {
		[SessionState.Active]: 'Active',
		[SessionState.Expired]: 'Waiting to Close',
		[SessionState.Closed]: 'Ready for Winner Selection',
		[SessionState.WinnerPicked]: 'Winner Picked',
		[SessionState.Completed]: 'Prizes Distributed',
	};
	return labels[state] || 'Unknown';
}

// export { SessionInfo, SessionState };
