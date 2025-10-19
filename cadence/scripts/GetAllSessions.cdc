import "Lotto"

/// Script to get all sessions for a wallet address
///
/// @param sessionOwner: Address of the session creator
/// @return Array of SessionInfo structs (active + completed)
access(all) fun main(sessionOwner: Address): [Lotto.SessionInfo] {
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    
    if let sessionManager = cap.borrow() {
        return sessionManager.getAllSessions()
    }
    
    return []
}
