import "Lotto"

/// Script to get information about a lottery session
///
/// @param sessionOwner: Address of the session creator
/// @return SessionInfo struct with session details (active session only)
access(all) fun main(sessionOwner: Address): Lotto.SessionInfo? {
    // Get public capability
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    
    if let sessionManager = cap.borrow() {
        return sessionManager.getActiveSession()
    }
    
    return nil
}
