import "FungibleToken"
import "FlowToken"
import "FlowTransactionScheduler"
import "FlowTransactionSchedulerUtils"

/// Lotto - Decentralized Lottery System with Flow Forte Scheduled Transactions
/// 
/// This contract implements a fully autonomous lottery system using Flow Forte features:
/// - Native Scheduled Transactions for automatic winner selection
/// - Provably fair randomness with revertibleRandom()
/// - Time-based session management
/// - Automatic prize distribution (85% winner, 10% creator, 5% platform)
///
access(all) contract Lotto {

    // ========================================
    // Constants
    // ========================================
    
    /// Platform fee percentage (5%)
    access(all) let platformFeePercentage: UFix64
    
    /// Creator fee percentage (10%)
    access(all) let creatorFeePercentage: UFix64
    
    /// Maximum tickets per wallet
    access(all) let maxTicketsPerWallet: UInt64
    
    /// Delay in seconds after session end before automatic winner selection
    /// This provides a buffer for final ticket purchases and adds security
    access(all) let winnerSelectionDelayInSeconds: UFix64

    // ========================================
    // State Variables
    // ========================================
    
    /// Platform admin address for receiving fees
    access(all) var platformAddress: Address
    
    /// Counter for generating unique session IDs
    access(all) var nextSessionID: UInt64

    // ========================================
    // Storage Paths
    // ========================================
    
    access(all) let SessionStoragePath: StoragePath
    access(all) let SessionPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath
    access(all) let WinnerSelectionHandlerStoragePath: StoragePath
    access(all) let WinnerSelectionHandlerPublicPath: PublicPath

    // ========================================
    // Events
    // ========================================
    
    access(all) event ContractInitialized()
    access(all) event SessionCreated(
        sessionID: UInt64, 
        creator: Address, 
        ticketPrice: UFix64, 
        endTime: UFix64,
        scheduledWinnerSelectionTime: UFix64
    )
    access(all) event TicketPurchased(
        sessionID: UInt64,
        buyer: Address,
        ticketsPurchased: UInt64,
        totalTickets: UInt64,
        amountPaid: UFix64,
        newPoolTotal: UFix64
    )
    access(all) event PlatformAddressUpdated(oldAddress: Address, newAddress: Address)
    access(all) event WinnerSelectionScheduled(
        sessionID: UInt64,
        creator: Address,
        scheduledFor: UFix64,
        scheduledTransactionID: UInt64?
    )
    access(all) event SessionExpired(sessionID: UInt64, totalPool: UFix64, totalTickets: UInt64)
    access(all) event WinnerSelected(sessionID: UInt64, winner: Address, totalTickets: UInt64, winnerTickets: UInt64, prize: UFix64)
    access(all) event PrizesDistributed(
        sessionID: UInt64,
        winner: Address,
        winnerAmount: UFix64,
        creatorAmount: UFix64,
        platformAmount: UFix64
    )
    access(all) event SessionRefunded(sessionID: UInt64, creator: Address, refundAmount: UFix64)

    // ========================================
    // Enums
    // ========================================
    
    /// Session lifecycle states
    access(all) enum SessionState: UInt8 {
        access(all) case Active       // Accepting tickets
        access(all) case Expired      // Time passed, awaiting automatic winner selection
        access(all) case WinnerPicked // Winner selected, ready for distribution
        access(all) case Completed    // Prizes distributed
    }

    // ========================================
    // Public Interfaces
    // ========================================
    
    /// Public interface for buying tickets
    access(all) resource interface SessionPublic {
        access(all) fun buyTickets(buyer: Address, payment: @FlowToken.Vault, numberOfTickets: UInt64)
        access(all) view fun getUserTicketCount(user: Address): UInt64
        access(all) view fun canUserBuyTickets(user: Address, numberOfTickets: UInt64): Bool
        access(all) fun getSessionInfo(): SessionInfo
    }

    // ========================================
    // Session Resource
    // ========================================
    
    /// A lottery session that holds funds and manages participants
    access(all) resource Session: SessionPublic {
        
        /// Unique identifier for this session
        access(all) let sessionID: UInt64
        
        /// Address of the session creator
        access(all) let creator: Address
        
        /// Price per ticket in FLOW tokens
        access(all) let ticketPrice: UFix64
        
        /// Unix timestamp when session ends
        access(all) let endTime: UFix64
        
        /// Timestamp when session was created
        access(all) let createdAt: UFix64
        
        /// Timestamp when winner selection is scheduled (endTime + delay)
        access(all) let scheduledWinnerSelectionTime: UFix64
        
        /// Whether the session has ended
        access(all) var isEnded: Bool
        
        /// Vault to hold accumulated FLOW tokens
        access(self) let vault: @FlowToken.Vault
        
        /// List of participant addresses (can appear multiple times for multiple tickets)
        access(all) var participants: [Address]
        
        /// Mapping of address to ticket count
        access(all) var participantTickets: {Address: UInt64}
        
        /// Session state
        access(all) var state: SessionState
        
        /// Winner address (set after winner selection)
        access(all) var winner: Address?
        
        /// Whether prizes have been distributed
        access(all) var prizesDistributed: Bool

        init(creator: Address, ticketPrice: UFix64, endTime: UFix64) {
            pre {
                ticketPrice > 0.0: "Ticket price must be greater than 0"
                endTime > getCurrentBlock().timestamp: "End time must be in the future"
            }
            
            self.sessionID = Lotto.nextSessionID
            self.creator = creator
            self.ticketPrice = ticketPrice
            self.endTime = endTime
            self.createdAt = getCurrentBlock().timestamp
            self.scheduledWinnerSelectionTime = endTime + Lotto.winnerSelectionDelayInSeconds
            self.isEnded = false
            self.vault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
            self.participants = []
            self.participantTickets = {}
            self.state = SessionState.Active
            self.winner = nil
            self.prizesDistributed = false
            
            Lotto.nextSessionID = Lotto.nextSessionID + 1
        }
        
        /// Get total accumulated funds
        access(all) view fun getTotalPool(): UFix64 {
            return self.vault.balance
        }
        
        /// Get total number of tickets sold
        access(all) view fun getTotalTickets(): UInt64 {
            return UInt64(self.participants.length)
        }
        
        /// Check if session is still active
        access(all) view fun isActive(): Bool {
            return !self.isEnded && getCurrentBlock().timestamp < self.endTime
        }
        
        /// Mark session as ended and expired (automatic on expiration)
        access(contract) fun markAsEnded() {
            self.isEnded = true
            self.state = SessionState.Expired
        }
        
        /// Set the winner address (called after winner selection)
        access(contract) fun setWinner(winner: Address) {
            self.winner = winner
            self.state = SessionState.WinnerPicked
        }
        
        /// Mark prizes as distributed
        access(contract) fun markPrizesDistributed() {
            self.prizesDistributed = true
            self.state = SessionState.Completed
        }
        
        /// Withdraw from vault (only callable by SessionManager for prize distribution)
        access(contract) fun withdrawFromVault(amount: UFix64): @{FungibleToken.Vault} {
            return <- self.vault.withdraw(amount: amount)
        }
        
        /// Update session state based on current conditions
        access(all) fun updateState() {
            if self.prizesDistributed {
                self.state = SessionState.Completed
            } else if self.winner != nil {
                self.state = SessionState.WinnerPicked
            } else if self.isEnded || getCurrentBlock().timestamp >= self.endTime {
                self.state = SessionState.Expired
            } else {
                self.state = SessionState.Active
            }
        }
        
        /// Get current session state (auto-updates)
        access(all) fun getState(): SessionState {
            self.updateState()
            return self.state
        }
        
        /// Get number of tickets a user has purchased
        access(all) view fun getUserTicketCount(user: Address): UInt64 {
            return self.participantTickets[user] ?? 0
        }
        
        /// Check if a user can buy a specific number of tickets
        access(all) view fun canUserBuyTickets(user: Address, numberOfTickets: UInt64): Bool {
            // Check if session is active
            if !self.isActive() {
                return false
            }
            
            // Check if number of tickets is valid (1-3)
            if numberOfTickets == 0 || numberOfTickets > Lotto.maxTicketsPerWallet {
                return false
            }
            
            // Check if user would exceed max tickets
            let currentTickets = self.getUserTicketCount(user: user)
            if currentTickets + numberOfTickets > Lotto.maxTicketsPerWallet {
                return false
            }
            
            return true
        }
        
        /// Get session info struct (helper for external access)
        access(all) fun getSessionInfo(): SessionInfo {
            return self.toSessionInfo()
        }
        
        /// Internal helper to convert Session to SessionInfo
        access(self) fun toSessionInfo(): SessionInfo {
            let ticketsCopy: {Address: UInt64} = {}
            for address in self.participantTickets.keys {
                ticketsCopy[address] = self.participantTickets[address]!
            }
            
            return SessionInfo(
                sessionID: self.sessionID,
                creator: self.creator,
                ticketPrice: self.ticketPrice,
                endTime: self.endTime,
                createdAt: self.createdAt,
                totalPool: self.getTotalPool(),
                totalTickets: self.getTotalTickets(),
                participantTickets: ticketsCopy,
                state: self.getState(),
                winner: self.winner,
                scheduledWinnerSelectionTime: self.scheduledWinnerSelectionTime,
                prizesDistributed: self.prizesDistributed
            )
        }
        
        /// Buy tickets for this session
        access(all) fun buyTickets(buyer: Address, payment: @FlowToken.Vault, numberOfTickets: UInt64) {
            pre {
                self.isActive(): "Session is not active"
                numberOfTickets > 0: "Must purchase at least 1 ticket"
                numberOfTickets <= Lotto.maxTicketsPerWallet: "Cannot purchase more than max tickets per transaction"
            }
            
            // Get current ticket count for buyer
            let currentTickets = self.getUserTicketCount(user: buyer)
            
            // Check if buyer would exceed max tickets
            assert(
                currentTickets + numberOfTickets <= Lotto.maxTicketsPerWallet,
                message: "Purchase would exceed maximum tickets per wallet (".concat(Lotto.maxTicketsPerWallet.toString()).concat(")")
            )
            
            // Calculate required payment
            let requiredAmount = self.ticketPrice * UFix64(numberOfTickets)
            
            // Validate exact payment
            assert(
                payment.balance == requiredAmount,
                message: "Incorrect payment amount. Required: ".concat(requiredAmount.toString()).concat(" FLOW")
            )
            
            // Deposit payment into session vault
            self.vault.deposit(from: <-payment)
            
            // Add tickets to participants array (for random selection)
            var i: UInt64 = 0
            while i < numberOfTickets {
                self.participants.append(buyer)
                i = i + 1
            }
            
            // Update participant ticket count
            self.participantTickets[buyer] = currentTickets + numberOfTickets
            
            // Emit event
            emit TicketPurchased(
                sessionID: self.sessionID,
                buyer: buyer,
                ticketsPurchased: numberOfTickets,
                totalTickets: currentTickets + numberOfTickets,
                amountPaid: requiredAmount,
                newPoolTotal: self.vault.balance
            )
        }
    }

    // ========================================
    // Public Interface
    // ========================================
    
    /// Public interface to read session information and buy tickets
    access(all) resource interface SessionManagerPublic {
        access(all) fun getActiveSessionID(): UInt64?
        access(all) fun getActiveSession(): SessionInfo?
        access(all) fun getSessionByID(sessionID: UInt64): SessionInfo?
        access(all) fun getAllSessions(): [SessionInfo]
        access(all) fun getCompletedSessions(): [SessionInfo]
        access(all) fun getTotalSessionsCount(): Int
        
        // Ticket purchase methods (routed to active session)
        access(all) fun buyTicketsForActiveSession(buyer: Address, payment: @FlowToken.Vault, numberOfTickets: UInt64)
        access(all) fun getUserTicketCountForActiveSession(user: Address): UInt64
        access(all) fun canUserBuyTicketsForActiveSession(user: Address, numberOfTickets: UInt64): Bool
        
        // Session lifecycle methods (automatic via Flow Actions)
        access(all) fun selectWinnerAutomatically(sessionID: UInt64)
    }
    
    /// Struct to return session information
    access(all) struct SessionInfo {
        access(all) let sessionID: UInt64
        access(all) let creator: Address
        access(all) let ticketPrice: UFix64
        access(all) let endTime: UFix64
        access(all) let createdAt: UFix64
        access(all) let totalPool: UFix64
        access(all) let totalTickets: UInt64
        access(all) let participantTickets: {Address: UInt64}
        access(all) let state: SessionState
        access(all) let winner: Address?
        access(all) let scheduledWinnerSelectionTime: UFix64
        access(all) let prizesDistributed: Bool
        
        init(
            sessionID: UInt64,
            creator: Address,
            ticketPrice: UFix64,
            endTime: UFix64,
            createdAt: UFix64,
            totalPool: UFix64,
            totalTickets: UInt64,
            participantTickets: {Address: UInt64},
            state: SessionState,
            winner: Address?,
            scheduledWinnerSelectionTime: UFix64,
            prizesDistributed: Bool
        ) {
            self.sessionID = sessionID
            self.creator = creator
            self.ticketPrice = ticketPrice
            self.endTime = endTime
            self.createdAt = createdAt
            self.totalPool = totalPool
            self.totalTickets = totalTickets
            self.participantTickets = participantTickets
            self.state = state
            self.winner = winner
            self.scheduledWinnerSelectionTime = scheduledWinnerSelectionTime
            self.prizesDistributed = prizesDistributed
        }
    }

    // ========================================
    // Session Manager Resource
    // ========================================
    
    /// Resource to manage lottery sessions with history
    access(all) resource SessionManager: SessionManagerPublic {
        
        /// Currently active session
        access(self) var activeSession: @Session?
        
        /// Archive of completed sessions
        access(self) let completedSessions: @{UInt64: Session}
        
        /// List of all session IDs in order
        access(all) let sessionIDs: [UInt64]

        init() {
            self.activeSession <- nil
            self.completedSessions <- {}
            self.sessionIDs = []
        }
        
        /// Create a new lottery session
        access(all) fun createSession(creator: Address, ticketPrice: UFix64, endTime: UFix64) {
            pre {
                self.activeSession == nil: "An active session already exists. Complete it before creating a new one."
            }
            
            let newSession <- create Session(
                creator: creator,
                ticketPrice: ticketPrice,
                endTime: endTime
            )
            
            let sessionID = newSession.sessionID
            let scheduledWinnerSelectionTime = newSession.scheduledWinnerSelectionTime
            self.sessionIDs.append(sessionID)
            
            self.activeSession <-! newSession
            
            emit SessionCreated(
                sessionID: sessionID,
                creator: creator,
                ticketPrice: ticketPrice,
                endTime: endTime,
                scheduledWinnerSelectionTime: scheduledWinnerSelectionTime
            )
            
            // Emit scheduled winner selection event
            // scheduledTransactionID will be nil for now (set in transaction)
            emit WinnerSelectionScheduled(
                sessionID: sessionID,
                creator: creator,
                scheduledFor: scheduledWinnerSelectionTime,
                scheduledTransactionID: nil
            )
        }
        
        /// Helper to convert Session to SessionInfo
        access(self) fun sessionToInfo(_ session: &Session): SessionInfo {
            // Copy the participantTickets dictionary
            let ticketsCopy: {Address: UInt64} = {}
            for address in session.participantTickets.keys {
                ticketsCopy[address] = session.participantTickets[address]!
            }
            
            return SessionInfo(
                sessionID: session.sessionID,
                creator: session.creator,
                ticketPrice: session.ticketPrice,
                endTime: session.endTime,
                createdAt: session.createdAt,
                totalPool: session.getTotalPool(),
                totalTickets: session.getTotalTickets(),
                participantTickets: ticketsCopy,
                state: session.getState(),
                winner: session.winner,
                scheduledWinnerSelectionTime: session.scheduledWinnerSelectionTime,
                prizesDistributed: session.prizesDistributed
            )
        }
        
        /// Get active session ID
        access(all) fun getActiveSessionID(): UInt64? {
            if let session = &self.activeSession as &Session? {
                return session.sessionID
            }
            return nil
        }
        
        /// Get active session info
        access(all) fun getActiveSession(): SessionInfo? {
            if let session = &self.activeSession as &Session? {
                return self.sessionToInfo(session)
            }
            return nil
        }
        
        /// Get session by ID (checks both active and completed)
        access(all) fun getSessionByID(sessionID: UInt64): SessionInfo? {
            // Check active session first
            if let activeSession = &self.activeSession as &Session? {
                if activeSession.sessionID == sessionID {
                    return self.sessionToInfo(activeSession)
                }
            }
            
            // Check completed sessions
            if let completedSession = &self.completedSessions[sessionID] as &Session? {
                return self.sessionToInfo(completedSession)
            }
            
            return nil
        }
        
        /// Get all sessions (active + completed) in chronological order
        access(all) fun getAllSessions(): [SessionInfo] {
            let sessions: [SessionInfo] = []
            
            // Add all sessions in order of their IDs
            for sessionID in self.sessionIDs {
                if let sessionInfo = self.getSessionByID(sessionID: sessionID) {
                    sessions.append(sessionInfo)
                }
            }
            
            return sessions
        }
        
        /// Get only completed sessions
        access(all) fun getCompletedSessions(): [SessionInfo] {
            let sessions: [SessionInfo] = []
            
            for sessionID in self.completedSessions.keys {
                if let session = &self.completedSessions[sessionID] as &Session? {
                    sessions.append(self.sessionToInfo(session))
                }
            }
            
            return sessions
        }
        
        /// Get total number of sessions created
        access(all) fun getTotalSessionsCount(): Int {
            return self.sessionIDs.length
        }
        
        /// Archive active session (moves it to completed sessions)
        access(all) fun archiveActiveSession() {
            pre {
                self.activeSession != nil: "No active session to archive"
            }
            
            // Mark session as ended before archiving
            if let session = &self.activeSession as &Session? {
                session.markAsEnded()
            }
            
            let session <- self.activeSession <- nil
            let sessionID = session?.sessionID!
            
            self.completedSessions[sessionID] <-! session
        }
        
        // ========================================
        // Ticket Purchase Methods (Route to Active Session)
        // ========================================
        
        /// Buy tickets for the active session
        access(all) fun buyTicketsForActiveSession(buyer: Address, payment: @FlowToken.Vault, numberOfTickets: UInt64) {
            pre {
                self.activeSession != nil: "No active session"
            }
            
            if let session = &self.activeSession as &Session? {
                session.buyTickets(buyer: buyer, payment: <-payment, numberOfTickets: numberOfTickets)
            } else {
                panic("No active session")
            }
        }
        
        /// Get ticket count for a user in the active session
        access(all) fun getUserTicketCountForActiveSession(user: Address): UInt64 {
            return self.activeSession?.getUserTicketCount(user: user) ?? 0
        }
        
        /// Check if user can buy tickets in the active session
        access(all) fun canUserBuyTicketsForActiveSession(user: Address, numberOfTickets: UInt64): Bool {
            return self.activeSession?.canUserBuyTickets(user: user, numberOfTickets: numberOfTickets) ?? false
        }
        
        // ========================================
        // Session Closing and Winner Selection
        // ========================================
        
        /// Select winner automatically using on-chain randomness
        /// Triggered automatically by Flow Actions at scheduled time
        /// Can also be called manually after scheduled time
        access(all) fun selectWinnerAutomatically(sessionID: UInt64) {
            // For active session, archive it first if expired
            if let session = &self.activeSession as &Session? {
                if session.sessionID == sessionID {
                    // Verify session has expired
                    assert(
                        getCurrentBlock().timestamp >= session.endTime,
                        message: "Session has not expired yet. Ends at: ".concat(session.endTime.toString())
                    )
                    
                    // Verify not already ended
                    assert(!session.isEnded, message: "Session already ended")
                    
                    session.markAsEnded()
                    
                    emit SessionExpired(
                        sessionID: sessionID,
                        totalPool: session.getTotalPool(),
                        totalTickets: session.getTotalTickets()
                    )
                    
                    // Archive the session
                    self.archiveActiveSession()
                }
            }
            
            // Now get session from completed sessions
            let session = &self.completedSessions[sessionID] as &Session?
                ?? panic("Session not found in completed sessions")
            
            // Verify session is expired and not already processed
            assert(session.isEnded, message: "Session not yet ended")
            assert(session.state == SessionState.Expired, message: "Session state must be Expired")
            assert(session.winner == nil, message: "Winner already selected")
            
            // Check if session has participants
            let totalTickets = session.getTotalTickets()
            if totalTickets == 0 {
                // No participants - refund creator (minus platform fee)
                self.refundCreator(sessionID: sessionID)
                return
            }
            
            // Generate random number using revertibleRandom
            let randomSeed = revertibleRandom<UInt64>()
            let winningTicket = randomSeed % totalTickets
            
            // Find winner based on ticket distribution
            var currentIndex: UInt64 = 0
            var winnerFound = false
            var winnerAddress: Address? = nil
            var winnerTickets: UInt64 = 0
            
            for participant in session.participantTickets.keys {
                let ticketCount = session.participantTickets[participant]!
                
                if winningTicket >= currentIndex && winningTicket < currentIndex + ticketCount {
                    winnerAddress = participant
                    winnerTickets = ticketCount
                    winnerFound = true
                    break
                }
                
                currentIndex = currentIndex + ticketCount
            }
            
            assert(winnerFound, message: "Failed to select winner")
            
            session.setWinner(winner: winnerAddress!)
            
            let totalPool = session.getTotalPool()
            let winnerPrize = totalPool * 0.85  // 85% to winner
            
            emit WinnerSelected(
                sessionID: sessionID,
                winner: winnerAddress!,
                totalTickets: totalTickets,
                winnerTickets: winnerTickets,
                prize: winnerPrize
            )
            
            // Automatically distribute prizes
            self.distributePrizes(sessionID: sessionID)
        }
        
        /// Distribute prizes (internal, called by selectWinnerAutomatically)
        access(contract) fun distributePrizes(sessionID: UInt64) {
            let session = &self.completedSessions[sessionID] as &Session?
                ?? panic("Session not found")
            
            // Verify prerequisites
            assert(session.winner != nil, message: "No winner selected")
            assert(!session.prizesDistributed, message: "Prizes already distributed")
            
            let totalPool = session.getTotalPool()
            
            // Calculate splits: 85% winner, 10% creator, 5% platform
            let winnerAmount = totalPool * 0.85      // 85%
            let creatorAmount = totalPool * 0.10     // 10%
            let platformAmount = totalPool * 0.05    // 5%
            
            // Withdraw from session vault using helper method
            let winnerVault <- session.withdrawFromVault(amount: winnerAmount)
            let creatorVault <- session.withdrawFromVault(amount: creatorAmount)
            let platformVault <- session.withdrawFromVault(amount: platformAmount)
            
            // Get receiver capabilities
            let winnerReceiver = getAccount(session.winner!)
                .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                .borrow() ?? panic("Winner has no FlowToken receiver")
            
            let creatorReceiver = getAccount(session.creator)
                .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                .borrow() ?? panic("Creator has no FlowToken receiver")
            
            let platformReceiver = getAccount(Lotto.platformAddress)
                .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                .borrow() ?? panic("Platform has no FlowToken receiver")
            
            // Deposit to recipients
            winnerReceiver.deposit(from: <-winnerVault)
            creatorReceiver.deposit(from: <-creatorVault)
            platformReceiver.deposit(from: <-platformVault)
            
            // Mark as complete
            session.markPrizesDistributed()
            
            emit PrizesDistributed(
                sessionID: sessionID,
                winner: session.winner!,
                winnerAmount: winnerAmount,
                creatorAmount: creatorAmount,
                platformAmount: platformAmount
            )
        }
        
        /// Refund creator when session has no participants (internal)
        access(contract) fun refundCreator(sessionID: UInt64) {
            let session = &self.completedSessions[sessionID] as &Session?
                ?? panic("Session not found")
            
            let totalPool = session.getTotalPool()
            
            if totalPool > 0.0 {
                let platformFee = totalPool * 0.05  // 5% platform fee
                let refundAmount = totalPool - platformFee
                
                // Send platform fee
                if platformFee > 0.0 {
                    let platformVault <- session.withdrawFromVault(amount: platformFee)
                    let platformReceiver = getAccount(Lotto.platformAddress)
                        .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                        .borrow() ?? panic("Platform has no receiver")
                    platformReceiver.deposit(from: <-platformVault)
                }
                
                // Refund creator
                if refundAmount > 0.0 {
                    let creatorVault <- session.withdrawFromVault(amount: refundAmount)
                    let creatorReceiver = getAccount(session.creator)
                        .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                        .borrow() ?? panic("Creator has no receiver")
                    creatorReceiver.deposit(from: <-creatorVault)
                }
            }
            
            session.markPrizesDistributed()
            
            emit SessionRefunded(
                sessionID: sessionID,
                creator: session.creator,
                refundAmount: totalPool - (totalPool * 0.025)
            )
        }
    }

    // ========================================
    // Scheduled Transaction Handler
    // ========================================
    
    /// Handler resource for scheduled winner selection
    /// Implements FlowTransactionScheduler.TransactionHandler interface
    access(all) resource WinnerSelectionHandler: FlowTransactionScheduler.TransactionHandler {
        
        /// Execute winner selection for a session
        /// This function is called automatically by FlowTransactionScheduler at the scheduled time
        access(FlowTransactionScheduler.Execute) fun executeTransaction(id: UInt64, data: AnyStruct?) {
            // Data should contain: {sessionID: UInt64, creator: Address}
            let sessionData = data as! {String: AnyStruct}
            let sessionID = sessionData["sessionID"]! as! UInt64
            let creator = sessionData["creator"]! as! Address
            
            // Get the session manager from creator's account
            let managerRef = getAccount(creator)
                .capabilities.get<&{Lotto.SessionManagerPublic}>(Lotto.SessionPublicPath)
                .borrow()
                ?? panic("Could not borrow SessionManager from creator account")
            
            // Execute automatic winner selection
            managerRef.selectWinnerAutomatically(sessionID: sessionID)
            
            log("Scheduled winner selection executed for session #".concat(sessionID.toString()))
        }

        access(all) view fun getViews(): [Type] {
            return [Type<StoragePath>(), Type<PublicPath>()]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<StoragePath>():
                    return Lotto.WinnerSelectionHandlerStoragePath
                case Type<PublicPath>():
                    return Lotto.WinnerSelectionHandlerPublicPath
                default:
                    return nil
            }
        }
    }

    // ========================================
    // Admin Resource
    // ========================================
    
    /// Admin resource for platform management
    access(all) resource Admin {
        
        /// Update the platform address for receiving fees
        access(all) fun updatePlatformAddress(newAddress: Address) {
            let oldAddress = Lotto.platformAddress
            Lotto.platformAddress = newAddress
            emit PlatformAddressUpdated(oldAddress: oldAddress, newAddress: newAddress)
        }
    }

    // ========================================
    // Public Functions
    // ========================================
    
    /// Create a new session manager for users
    access(all) fun createSessionManager(): @SessionManager {
        return <- create SessionManager()
    }

    /// Create a new winner selection handler for scheduled transactions
    access(all) fun createWinnerSelectionHandler(): @WinnerSelectionHandler {
        return <- create WinnerSelectionHandler()
    }

    // ========================================
    // Contract Initialization
    // ========================================
    
    init() {
        // Set fee percentages
        self.platformFeePercentage = 0.05  // 5% platform fee
        self.creatorFeePercentage = 0.10   // 10% creator fee
        self.maxTicketsPerWallet = 3
        self.winnerSelectionDelayInSeconds = 50.0  // 50 seconds after session end
        
        // Set platform address to contract account initially
        self.platformAddress = self.account.address
        
        // Initialize session counter
        self.nextSessionID = 1
        
        // Set storage paths
        self.SessionStoragePath = /storage/LottoSessionManager
        self.SessionPublicPath = /public/LottoSessionManager
        self.AdminStoragePath = /storage/LottoAdmin
        self.WinnerSelectionHandlerStoragePath = /storage/LottoWinnerSelectionHandler
        self.WinnerSelectionHandlerPublicPath = /public/LottoWinnerSelectionHandler
        
        // Create and save admin resource
        self.account.storage.save(<-create Admin(), to: self.AdminStoragePath)
        
        emit ContractInitialized()
    }
}
