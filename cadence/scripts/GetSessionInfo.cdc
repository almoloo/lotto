import "Lotto"

/// Script to get information about a lottery session
///
/// @param sessionOwner: Address of the session creator
/// @return SessionInfo struct with session details
access(all) struct SessionInfo {
    access(all) let sessionID: UInt64
    access(all) let creator: Address
    access(all) let ticketPrice: UFix64
    access(all) let endTime: UFix64
    access(all) let createdAt: UFix64
    access(all) let isEnded: Bool
    access(all) let totalPool: UFix64
    access(all) let totalTickets: UInt64
    access(all) let isActive: Bool
    
    init(
        sessionID: UInt64,
        creator: Address,
        ticketPrice: UFix64,
        endTime: UFix64,
        createdAt: UFix64,
        isEnded: Bool,
        totalPool: UFix64,
        totalTickets: UInt64,
        isActive: Bool
    ) {
        self.sessionID = sessionID
        self.creator = creator
        self.ticketPrice = ticketPrice
        self.endTime = endTime
        self.createdAt = createdAt
        self.isEnded = isEnded
        self.totalPool = totalPool
        self.totalTickets = totalTickets
        self.isActive = isActive
    }
}

access(all) fun main(sessionOwner: Address): SessionInfo? {
    // Get public capability
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    
    if let sessionManager = cap.borrow() {
        // Check if session exists
        if let sessionID = sessionManager.getSessionID() {
            return SessionInfo(
                sessionID: sessionID,
                creator: sessionManager.getCreator()!,
                ticketPrice: sessionManager.getTicketPrice()!,
                endTime: sessionManager.getEndTime()!,
                createdAt: sessionManager.getCreatedAt()!,
                isEnded: sessionManager.getIsEnded(),
                totalPool: sessionManager.getTotalPool(),
                totalTickets: sessionManager.getTotalTickets(),
                isActive: sessionManager.isActive()
            )
        }
    }
    
    return nil
}
