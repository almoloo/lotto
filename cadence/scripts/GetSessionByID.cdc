import "Lotto"

/// Script to get session by ID
///
/// @param sessionOwner: Address of the session creator
/// @param sessionID: ID of the session to retrieve
/// @return SessionInfo struct or nil if not found
access(all) fun main(sessionOwner: Address, sessionID: UInt64): Lotto.SessionInfo? {
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    
    if let sessionManager = cap.borrow() {
        return sessionManager.getSessionByID(sessionID: sessionID)
    }
    
    return nil
}
