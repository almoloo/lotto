import "FungibleToken"
import "FlowToken"

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

    // ========================================
    // Events
    // ========================================
    
    access(all) event ContractInitialized()
    access(all) event SessionCreated(
        sessionID: UInt64, 
        creator: Address, 
        ticketPrice: UFix64, 
        endTime: UFix64
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
        
        /// Whether the session has ended
        access(all) var isEnded: Bool
        
        /// Vault to hold accumulated FLOW tokens
        access(self) let vault: @FlowToken.Vault
        
        /// List of participant addresses (can appear multiple times for multiple tickets)
        access(all) var participants: [Address]
        
        /// Mapping of address to ticket count
        access(all) var participantTickets: {Address: UInt64}

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
            self.isEnded = false
            self.vault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
            self.participants = []
            self.participantTickets = {}
            
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
        
        /// Mark session as ended (called when archiving or ending session)
        access(contract) fun markAsEnded() {
            self.isEnded = true
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
                isEnded: self.isEnded,
                totalPool: self.getTotalPool(),
                totalTickets: self.getTotalTickets(),
                isActive: self.isActive(),
                participantTickets: ticketsCopy
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
    }
    
    /// Struct to return session information
    access(all) struct SessionInfo {
        access(all) let sessionID: UInt64
        access(all) let creator: Address
        access(all) let ticketPrice: UFix64
        access(all) let endTime: UFix64
        access(all) let createdAt: UFix64
        access(all) let isEnded: Bool
        access(all) let totalPool: UFix64
        access(all) let totalTickets: UInt64
        access(all) let isActive: Bool
        access(all) let participantTickets: {Address: UInt64}
        
        init(
            sessionID: UInt64,
            creator: Address,
            ticketPrice: UFix64,
            endTime: UFix64,
            createdAt: UFix64,
            isEnded: Bool,
            totalPool: UFix64,
            totalTickets: UInt64,
            isActive: Bool,
            participantTickets: {Address: UInt64}
        ) {
            self.sessionID = sessionID
            self.creator = creator
            self.ticketPrice = ticketPrice
            self.endTime = endTime
            self.createdAt = createdAt
            self.isEnded = isEnded
            self.totalPool = totalPool
            self.totalTickets = totalTickets
            self.isActive = isActive
            self.participantTickets = participantTickets
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
            self.sessionIDs.append(sessionID)
            
            self.activeSession <-! newSession
            
            emit SessionCreated(
                sessionID: sessionID,
                creator: creator,
                ticketPrice: ticketPrice,
                endTime: endTime
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
                isEnded: session.isEnded,
                totalPool: session.getTotalPool(),
                totalTickets: session.getTotalTickets(),
                isActive: session.isActive(),
                participantTickets: ticketsCopy
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

    // ========================================
    // Contract Initialization
    // ========================================
    
    init() {
        // Set fee percentages
        self.platformFeePercentage = 0.05  // 5%
        self.creatorFeePercentage = 0.10   // 10%
        self.maxTicketsPerWallet = 3
        
        // Set platform address to contract account initially
        self.platformAddress = self.account.address
        
        // Initialize session counter
        self.nextSessionID = 1
        
        // Set storage paths
        self.SessionStoragePath = /storage/LottoSessionManager
        self.SessionPublicPath = /public/LottoSessionManager
        self.AdminStoragePath = /storage/LottoAdmin
        
        // Create and save admin resource
        self.account.storage.save(<-create Admin(), to: self.AdminStoragePath)
        
        emit ContractInitialized()
    }
}
