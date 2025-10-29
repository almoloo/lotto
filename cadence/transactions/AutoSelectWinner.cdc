import "Lotto"

/// Transaction to automatically select winner for an expired session
/// This transaction is designed to be triggered by Flow Forte Actions at the scheduled time
/// Can also be called manually by anyone after the scheduled winner selection time
///
/// @param sessionOwner: Address of the session creator
/// @param sessionID: ID of the session to select winner for
transaction(sessionOwner: Address, sessionID: UInt64) {
    
    let sessionManager: &{Lotto.SessionManagerPublic}
    
    prepare(signer: &Account) {
        // Get session manager reference
        let managerCap = getAccount(sessionOwner)
            .capabilities.get<&{Lotto.SessionManagerPublic}>(Lotto.SessionPublicPath)
        
        self.sessionManager = managerCap.borrow()
            ?? panic("Could not borrow SessionManager reference from ".concat(sessionOwner.toString()))
    }
    
    execute {
        // Select winner automatically using on-chain randomness
        // This will:
        // 1. Archive the active session if it matches sessionID and is expired
        // 2. Generate random winner using revertibleRandom()
        // 3. Automatically distribute prizes (90% winner, 10% platform)
        self.sessionManager.selectWinnerAutomatically(sessionID: sessionID)
        
        log("Winner selected automatically and prizes distributed for session ".concat(sessionID.toString()))
    }
}
