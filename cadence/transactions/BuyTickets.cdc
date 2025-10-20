import "Lotto"
import "FungibleToken"
import "FlowToken"

/// Transaction to buy tickets for a lottery session
/// 
/// @param sessionOwner: Address of the session creator
/// @param numberOfTickets: Number of tickets to purchase (1-3)
transaction(sessionOwner: Address, numberOfTickets: UInt64) {
    
    let paymentVault: @FlowToken.Vault
    let sessionManager: &Lotto.SessionManager
    let buyerAddress: Address
    
    prepare(signer: auth(BorrowValue, Storage) &Account) {
        self.buyerAddress = signer.address
        
        // Get reference to SessionManager
        let managerCap = getAccount(sessionOwner)
            .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
        
        self.sessionManager = managerCap.borrow()
            ?? panic("Could not borrow SessionManager from address")
        
        // Get active session info to calculate payment
        let sessionInfo = self.sessionManager.getActiveSession()
            ?? panic("No active session found")
        
        let ticketPrice = sessionInfo.ticketPrice
        let requiredAmount = ticketPrice * UFix64(numberOfTickets)
        
        // Borrow FlowToken vault from storage
        let vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FlowToken vault from storage")
        
        // Withdraw payment
        self.paymentVault <- vault.withdraw(amount: requiredAmount) as! @FlowToken.Vault
    }
    
    execute {
        // Buy tickets through SessionManager
        self.sessionManager.buyTicketsForActiveSession(
            buyer: self.buyerAddress,
            payment: <-self.paymentVault,
            numberOfTickets: numberOfTickets
        )
    }
}
