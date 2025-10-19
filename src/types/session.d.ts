interface SessionInfo {
	sessionID: string;
	creator: string;
	ticketPrice: string;
	endTime: string;
	isActive: boolean;
	isEnded: boolean;
	totalPoolAmount: string;
	ticketsSold: string;
	participantCount: string;
	participantTickets: { [key: string]: string };
}

export { SessionInfo };
