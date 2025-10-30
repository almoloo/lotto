import "Lotto"

/// Script to get all sessions where a user has purchased tickets
///
/// @param sessionOwner: Address of the session manager owner
/// @param userAddress: Address of the user to check
/// @return Array of SessionInfo structs for sessions where user has tickets
access(all) fun main(sessionOwner: Address, userAddress: Address): [Lotto.SessionInfo] {
    // Get the session manager capability from the session owner
    let cap = getAccount(sessionOwner)
        .capabilities.get<&{Lotto.SessionManagerPublic}>(Lotto.SessionPublicPath)
    
    // Borrow the session manager reference
    if let sessionManager = cap.borrow() {
        // Return all sessions where the user has purchased tickets
        return sessionManager.getUserSessions(userAddress: userAddress)
    }
    
    // Return empty array if session manager not found
    return []
}
