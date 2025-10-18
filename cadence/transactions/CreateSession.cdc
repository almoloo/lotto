import "Lotto"

/// Transaction to create a new lottery session
/// 
/// @param ticketPrice: Price per ticket in FLOW tokens
/// @param endTime: Unix timestamp when the session ends
transaction(ticketPrice: UFix64, endTime: UFix64) {
    
    let sessionManager: &Lotto.SessionManager
    let signerAddress: Address
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.signerAddress = signer.address
        
        // Check if SessionManager already exists
        if signer.storage.borrow<&Lotto.SessionManager>(from: Lotto.SessionStoragePath) == nil {
            // Create new SessionManager
            let newManager <- Lotto.createSessionManager()
            signer.storage.save(<-newManager, to: Lotto.SessionStoragePath)
            
            // Create public capability
            let cap = signer.capabilities.storage.issue<&Lotto.SessionManager>(Lotto.SessionStoragePath)
            signer.capabilities.publish(cap, at: Lotto.SessionPublicPath)
        }
        
        // Borrow reference to SessionManager
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
    }
}
