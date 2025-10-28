interface SessionInfo {
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
}

interface UserTicketStatus {
	currentTickets: string;
	canBuyMore: boolean;
	maxTickets: string;
	remainingTickets: string;
}

export { SessionInfo, UserTicketStatus };
