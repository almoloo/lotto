import "Lotto"

/// Transaction to create a new lottery session
/// 
/// After the session expires, anyone can call CloseSession.cdc to:
/// - Select the winner using on-chain randomness
/// - Distribute prizes (85% winner, 10% creator, 2.5% platform, 2.5% closer)
/// - Earn a 2.5% fee for closing the session
///
/// @param ticketPrice: Price per ticket in FLOW tokens
/// @param endTime: Unix timestamp when the session ends
transaction(ticketPrice: UFix64, endTime: UFix64) {
    
    let sessionManager: &Lotto.SessionManager
    let signerAddress: Address
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.signerAddress = signer.address
        
        // Setup SessionManager if it doesn't exist
        if signer.storage.borrow<&Lotto.SessionManager>(from: Lotto.SessionStoragePath) == nil {
            let newManager <- Lotto.createSessionManager()
            signer.storage.save(<-newManager, to: Lotto.SessionStoragePath)
            
            let cap = signer.capabilities.storage.issue<&{Lotto.SessionManagerPublic}>(Lotto.SessionStoragePath)
            signer.capabilities.publish(cap, at: Lotto.SessionPublicPath)
        }
        
        self.sessionManager = signer.storage.borrow<&Lotto.SessionManager>(from: Lotto.SessionStoragePath)
            ?? panic("Could not borrow SessionManager reference")
    }
    
    execute {
        // Create the session
        self.sessionManager.createSession(
            creator: self.signerAddress,
            ticketPrice: ticketPrice,
            endTime: endTime
        )
        
        log("Session created with ticket price: ".concat(ticketPrice.toString())
            .concat(" FLOW and end time: ")
            .concat(endTime.toString()))
    }
}
