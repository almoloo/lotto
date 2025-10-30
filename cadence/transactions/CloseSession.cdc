import "Lotto"

/// Transaction to manually close an expired session and distribute prizes
/// Can be called by anyone after the session end time
/// The caller receives a 2.5% fee for closing the session
///
/// @param sessionOwner: Address of the session creator
/// @param sessionID: ID of the session to close
transaction(sessionOwner: Address, sessionID: UInt64) {
    
    let sessionManager: &{Lotto.SessionManagerPublic}
    let closer: Address
    
    prepare(signer: &Account) {
        // Store the signer's address as the closer
        self.closer = signer.address
        
        // Get session manager reference
        let managerCap = getAccount(sessionOwner)
            .capabilities.get<&{Lotto.SessionManagerPublic}>(Lotto.SessionPublicPath)
        
        self.sessionManager = managerCap.borrow()
            ?? panic("Could not borrow SessionManager reference from ".concat(sessionOwner.toString()))
    }
    
    execute {
        // Close session, select winner, and distribute prizes
        // This will:
        // 1. Archive the active session if it matches sessionID and is expired
        // 2. Generate random winner using revertibleRandom()
        // 3. Distribute prizes (85% winner, 10% creator, 2.5% platform, 2.5% closer)
        self.sessionManager.closeSessionAndDistribute(sessionID: sessionID, closer: self.closer)
        
        log("Session ".concat(sessionID.toString()).concat(" closed and prizes distributed by ").concat(self.closer.toString()))
    }
}
