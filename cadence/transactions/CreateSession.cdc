import "Lotto"
import "FlowToken"
import "FungibleToken"
import "FlowTransactionScheduler"
import "FlowTransactionSchedulerUtils"

/// Transaction to create a new lottery session with automatic winner selection scheduled
/// 
/// This transaction:
/// 1. Creates a lottery session
/// 2. Schedules automatic winner selection using FlowTransactionScheduler
/// 3. Pays the required fees for scheduled execution
///
/// @param ticketPrice: Price per ticket in FLOW tokens
/// @param endTime: Unix timestamp when the session ends
transaction(ticketPrice: UFix64, endTime: UFix64) {
    
    let sessionManager: &Lotto.SessionManager
    let schedulerManager: auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager}
    let signer: auth(Storage, Capabilities) &Account
    let signerAddress: Address
    let sessionID: UInt64
    
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.signer = signer
        self.signerAddress = signer.address
        
        // ========================================
        // 1. Setup SessionManager
        // ========================================
        
        if signer.storage.borrow<&Lotto.SessionManager>(from: Lotto.SessionStoragePath) == nil {
            let newManager <- Lotto.createSessionManager()
            signer.storage.save(<-newManager, to: Lotto.SessionStoragePath)
            
            let cap = signer.capabilities.storage.issue<&{Lotto.SessionManagerPublic}>(Lotto.SessionStoragePath)
            signer.capabilities.publish(cap, at: Lotto.SessionPublicPath)
        }
        
        self.sessionManager = signer.storage.borrow<&Lotto.SessionManager>(from: Lotto.SessionStoragePath)
            ?? panic("Could not borrow SessionManager reference")
        
        // ========================================
        // 2. Setup WinnerSelectionHandler
        // ========================================
        
        if signer.storage.borrow<&AnyResource>(from: Lotto.WinnerSelectionHandlerStoragePath) == nil {
            let handler <- Lotto.createWinnerSelectionHandler()
            signer.storage.save(<-handler, to: Lotto.WinnerSelectionHandlerStoragePath)
            
            // Create entitled capability for scheduler execution
            let _ = signer.capabilities.storage
                .issue<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>(
                    Lotto.WinnerSelectionHandlerStoragePath
                )
            
            // Create public capability
            let publicCap = signer.capabilities.storage
                .issue<&{FlowTransactionScheduler.TransactionHandler}>(Lotto.WinnerSelectionHandlerStoragePath)
            signer.capabilities.publish(publicCap, at: Lotto.WinnerSelectionHandlerPublicPath)
        }
        
        // ========================================
        // 3. Setup FlowTransactionSchedulerUtils.Manager
        // ========================================
        
        if !signer.storage.check<@AnyResource>(from: FlowTransactionSchedulerUtils.managerStoragePath) {
            let manager <- FlowTransactionSchedulerUtils.createManager()
            signer.storage.save(<-manager, to: FlowTransactionSchedulerUtils.managerStoragePath)
            
            let managerCap = signer.capabilities.storage
                .issue<&{FlowTransactionSchedulerUtils.Manager}>(FlowTransactionSchedulerUtils.managerStoragePath)
            signer.capabilities.publish(managerCap, at: FlowTransactionSchedulerUtils.managerPublicPath)
        }
        
        self.schedulerManager = signer.storage
            .borrow<auth(FlowTransactionSchedulerUtils.Owner) &{FlowTransactionSchedulerUtils.Manager}>(
                from: FlowTransactionSchedulerUtils.managerStoragePath
            ) ?? panic("Could not borrow scheduler Manager")
        
        // ========================================
        // 4. Create the session (store sessionID for later)
        // ========================================
        
        // Get next session ID before creating
        self.sessionID = Lotto.nextSessionID
        
        // Create the session (this increments nextSessionID)
        self.sessionManager.createSession(
            creator: self.signerAddress,
            ticketPrice: ticketPrice,
            endTime: endTime
        )
    }
    
    execute {
        // ========================================
        // 5. Schedule automatic winner selection
        // ========================================
        
        let scheduledTime = endTime + Lotto.winnerSelectionDelayInSeconds
        
        // Prepare transaction data for the handler
        let transactionData: {String: AnyStruct} = {
            "sessionID": self.sessionID,
            "creator": self.signerAddress
        }
        
        let priority = FlowTransactionScheduler.Priority.Medium
        let executionEffort: UInt64 = 10000  // Gas limit for winner selection
        
        // Estimate fees
        let estimate = FlowTransactionScheduler.estimate(
            data: transactionData,
            timestamp: scheduledTime,
            priority: priority,
            executionEffort: executionEffort
        )
        
        assert(
            estimate.timestamp != nil || priority == FlowTransactionScheduler.Priority.Low,
            message: estimate.error ?? "Estimation failed"
        )
        
        // Withdraw fees from signer's vault
        let vaultRef = self.signer.storage
            .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Missing FlowToken vault")
        
        let fees <- vaultRef.withdraw(amount: estimate.flowFee ?? 0.0) as! @FlowToken.Vault
        
        // Get handler capability
        var handlerCap: Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}>? = nil
        
        let controllers = self.signer.capabilities.storage
            .getControllers(forPath: Lotto.WinnerSelectionHandlerStoragePath)
        
        for controller in controllers {
            if let cap = controller.capability as? Capability<auth(FlowTransactionScheduler.Execute) &{FlowTransactionScheduler.TransactionHandler}> {
                handlerCap = cap
                break
            }
        }
        
        // Schedule the transaction
        let scheduledTxID = self.schedulerManager.schedule(
            handlerCap: handlerCap!,
            data: transactionData,
            timestamp: scheduledTime,
            priority: priority,
            executionEffort: executionEffort,
            fees: <-fees
        )
        
        log("Session #".concat(self.sessionID.toString())
            .concat(" created with automatic winner selection scheduled for ")
            .concat(scheduledTime.toString())
            .concat(" (Scheduled Transaction ID: ")
            .concat(scheduledTxID.toString())
            .concat(")"))
    }
}
