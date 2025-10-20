import "Lotto"

/// Script to get user's ticket information for a session
///
/// @param sessionOwner: Address of the session creator
/// @param userAddress: Address of the user to check
/// @return Struct with user's ticket info
access(all) struct UserTicketStatus {
    access(all) let currentTickets: UInt64
    access(all) let canBuyMore: Bool
    access(all) let maxTickets: UInt64
    access(all) let remainingTickets: UInt64
    
    init(currentTickets: UInt64, canBuyMore: Bool, maxTickets: UInt64, remainingTickets: UInt64) {
        self.currentTickets = currentTickets
        self.canBuyMore = canBuyMore
        self.maxTickets = maxTickets
        self.remainingTickets = remainingTickets
    }
}

access(all) fun main(sessionOwner: Address, userAddress: Address): UserTicketStatus? {
    // Get session manager capability
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    
    if let sessionManager = cap.borrow() {
        // Check if there's an active session
        if sessionManager.getActiveSession() != nil {
            let currentTickets = sessionManager.getUserTicketCountForActiveSession(user: userAddress)
            let maxTickets = Lotto.maxTicketsPerWallet
            let remainingTickets = maxTickets - currentTickets
            let canBuyMore = sessionManager.canUserBuyTicketsForActiveSession(user: userAddress, numberOfTickets: 1)
            
            return UserTicketStatus(
                currentTickets: currentTickets,
                canBuyMore: canBuyMore,
                maxTickets: maxTickets,
                remainingTickets: remainingTickets
            )
        }
    }
    
    return nil
}
