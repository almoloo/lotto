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
    access(all) event PlatformAddressUpdated(oldAddress: Address, newAddress: Address)

    // ========================================
    // Session Resource
    // ========================================
    
    /// A lottery session that holds funds and manages participants
    access(all) resource Session {
        
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
    }

    // ========================================
    // Public Interface
    // ========================================
    
    /// Public interface to read session information
    access(all) resource interface SessionManagerPublic {
        access(all) fun getSessionID(): UInt64?
        access(all) fun getCreator(): Address?
        access(all) fun getTicketPrice(): UFix64?
        access(all) fun getEndTime(): UFix64?
        access(all) fun getCreatedAt(): UFix64?
        access(all) fun getIsEnded(): Bool
        access(all) fun getTotalPool(): UFix64
        access(all) fun getTotalTickets(): UInt64
        access(all) fun isActive(): Bool
        access(all) fun getParticipantTickets(address: Address): UInt64
    }

    // ========================================
    // Session Manager Resource
    // ========================================
    
    /// Resource to manage a lottery session
    access(all) resource SessionManager: SessionManagerPublic {
        
        /// The session this manager controls
        access(self) var session: @Session?

        init() {
            self.session <- nil
        }
        
        /// Create a new lottery session
        access(all) fun createSession(creator: Address, ticketPrice: UFix64, endTime: UFix64) {
            pre {
                self.session == nil: "Session already exists in this manager"
            }
            
            let newSession <- create Session(
                creator: creator,
                ticketPrice: ticketPrice,
                endTime: endTime
            )
            
            let sessionID = newSession.sessionID
            
            self.session <-! newSession
            
            emit SessionCreated(
                sessionID: sessionID,
                creator: creator,
                ticketPrice: ticketPrice,
                endTime: endTime
            )
        }
        
        /// Get session ID
        access(all) fun getSessionID(): UInt64? {
            if let session = &self.session as &Session? {
                return session.sessionID
            }
            return nil
        }
        
        /// Get session creator
        access(all) fun getCreator(): Address? {
            if let session = &self.session as &Session? {
                return session.creator
            }
            return nil
        }
        
        /// Get ticket price
        access(all) fun getTicketPrice(): UFix64? {
            if let session = &self.session as &Session? {
                return session.ticketPrice
            }
            return nil
        }
        
        /// Get end time
        access(all) fun getEndTime(): UFix64? {
            if let session = &self.session as &Session? {
                return session.endTime
            }
            return nil
        }
        
        /// Get created at timestamp
        access(all) fun getCreatedAt(): UFix64? {
            if let session = &self.session as &Session? {
                return session.createdAt
            }
            return nil
        }
        
        /// Check if session is ended
        access(all) fun getIsEnded(): Bool {
            if let session = &self.session as &Session? {
                return session.isEnded
            }
            return false
        }
        
        /// Get total pool amount
        access(all) fun getTotalPool(): UFix64 {
            if let session = &self.session as &Session? {
                return session.getTotalPool()
            }
            return 0.0
        }
        
        /// Get total tickets sold
        access(all) fun getTotalTickets(): UInt64 {
            if let session = &self.session as &Session? {
                return session.getTotalTickets()
            }
            return 0
        }
        
        /// Check if session is active
        access(all) fun isActive(): Bool {
            if let session = &self.session as &Session? {
                return session.isActive()
            }
            return false
        }
        
        /// Get ticket count for a participant
        access(all) fun getParticipantTickets(address: Address): UInt64 {
            if let session = &self.session as &Session? {
                return session.participantTickets[address] ?? 0
            }
            return 0
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
