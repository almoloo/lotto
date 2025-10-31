import flowJSON from '../../flow.json';

const network = import.meta.env.VITE_NETWORK;

let contractAddress = '0x';

if (network === 'emulator') {
	contractAddress = `0x${flowJSON.accounts['emulator-account'].address}`;
} else if (network === 'testnet') {
	contractAddress = `0x${flowJSON.accounts['my-testnet-account'].address}`;
}

const fungibleTokenAddress = `0x${
	flowJSON.dependencies.FungibleToken.aliases[
		import.meta.env
			.VITE_NETWORK as keyof typeof flowJSON.dependencies.FungibleToken.aliases
	]
}`;

const flowTokenAddress = `0x${
	flowJSON.dependencies.FlowToken.aliases[
		import.meta.env
			.VITE_NETWORK as keyof typeof flowJSON.dependencies.FlowToken.aliases
	]
}`;

export const GET_ALL_SESSIONS = () => `
import Lotto from ${contractAddress}

access(all) fun main(sessionOwner: Address): [Lotto.SessionInfo] {
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    if let sessionManager = cap.borrow() {
        return sessionManager.getAllSessions()
    }
    return []
}
`;

export const CREATE_SESSION_TX = () => `
import Lotto from ${contractAddress}
import FungibleToken from ${fungibleTokenAddress}
import FlowToken from ${flowTokenAddress}

transaction(ticketPrice: UFix64, endTime: UFix64) {
    let sessionManager: &Lotto.SessionManager
    let signerAddress: Address
    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.signerAddress = signer.address
        if signer.storage.borrow<&Lotto.SessionManager>(from: Lotto.SessionStoragePath) == nil {
            let newManager <- Lotto.createSessionManager()
            signer.storage.save(<-newManager, to: Lotto.SessionStoragePath)
            let cap = signer.capabilities.storage.issue<&Lotto.SessionManager>(
                Lotto.SessionStoragePath
            )
            signer.capabilities.publish(cap, at: Lotto.SessionPublicPath)
        }
        self.sessionManager = signer.storage.borrow<&Lotto.SessionManager>(from: Lotto.SessionStoragePath)
            ?? panic("Could not borrow SessionManager reference")
    }
    
    execute {
        self.sessionManager.createSession(
            creator: self.signerAddress,
            ticketPrice: ticketPrice,
            endTime: endTime
        )
    }
}
`;

export const GET_SESSION_BY_ID = () => `
import Lotto from ${contractAddress}

access(all) fun main(sessionOwner: Address, sessionID: UInt64): Lotto.SessionInfo? {
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    if let sessionManager = cap.borrow() {
        return sessionManager.getSessionByID(sessionID: sessionID)
    }
    return nil
}
`;

export const GET_USER_TICKET_STATUS = () => `
import Lotto from ${contractAddress}

access(all) struct UserTicketStatus {
    access(all) let currentTickets: UInt64
    access(all) let canBuyMore: Bool
    access(all) let maxTickets: UInt64
    access(all) let remainingTickets: UInt64
    
    init(currentTickets: UInt64, canBuyMore: Bool, maxTickets: UInt64, remainingTickets: UInt64) {
        self.currentTickets = currentTickets
        self.canBuyMore = canBuyMore
        self.maxTickets = maxTickets
        self.remainingTickets = remainingTickets
    }
}

access(all) fun main(sessionOwner: Address, userAddress: Address): UserTicketStatus? {
    let cap = getAccount(sessionOwner)
        .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
    
    if let sessionManager = cap.borrow() {
        if sessionManager.getActiveSession() != nil {
            let currentTickets = sessionManager.getUserTicketCountForActiveSession(user: userAddress)
            let maxTickets = Lotto.maxTicketsPerWallet
            let remainingTickets = maxTickets - currentTickets
            let canBuyMore = sessionManager.canUserBuyTicketsForActiveSession(user: userAddress, numberOfTickets: 1)
            
            return UserTicketStatus(
                currentTickets: currentTickets,
                canBuyMore: canBuyMore,
                maxTickets: maxTickets,
                remainingTickets: remainingTickets
            )
        }
    }
    
    return nil
}
`;

export const BUY_TICKETS_TX = () => `
import Lotto from ${contractAddress}
import FungibleToken from ${fungibleTokenAddress}
import FlowToken from ${flowTokenAddress}

transaction(sessionOwner: Address, numberOfTickets: UInt64) {
    let paymentVault: @FlowToken.Vault
    let sessionManager: &Lotto.SessionManager
    let buyerAddress: Address
    
    prepare(signer: auth(BorrowValue, Storage) &Account) {
        self.buyerAddress = signer.address
        
        let managerCap = getAccount(sessionOwner)
            .capabilities.get<&Lotto.SessionManager>(Lotto.SessionPublicPath)
        
        self.sessionManager = managerCap.borrow()
            ?? panic("Could not borrow SessionManager from address")
        
        let sessionInfo = self.sessionManager.getActiveSession()
            ?? panic("No active session found")
        
        let ticketPrice = sessionInfo.ticketPrice
        let requiredAmount = ticketPrice * UFix64(numberOfTickets)
        
        let vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FlowToken vault from storage")
        
        self.paymentVault <- vault.withdraw(amount: requiredAmount) as! @FlowToken.Vault
    }
    
    execute {
        self.sessionManager.buyTicketsForActiveSession(
            buyer: self.buyerAddress,
            payment: <-self.paymentVault,
            numberOfTickets: numberOfTickets
        )
    }
}
`;

export const GET_USER_SESSIONS = () => `
import Lotto from ${contractAddress}

access(all) fun main(sessionOwner: Address, userAddress: Address): [Lotto.SessionInfo] {
    let cap = getAccount(sessionOwner)
        .capabilities.get<&{Lotto.SessionManagerPublic}>(Lotto.SessionPublicPath)
    
    if let sessionManager = cap.borrow() {
        return sessionManager.getUserSessions(userAddress: userAddress)
    }
    
    return []
}
`;

export const CLOSE_SESSION_TRANSACTION = () => `
import Lotto from ${contractAddress}
import FungibleToken from ${fungibleTokenAddress}
import FlowToken from ${flowTokenAddress}

transaction(sessionManagerAddress: Address, sessionID: UInt64) {
    let sessionManagerRef: &{Lotto.SessionManagerPublic}
    let closerAddress: Address

    prepare(signer: &Account) {
        self.closerAddress = signer.address
        
        self.sessionManagerRef = getAccount(sessionManagerAddress)
            .capabilities.get<&{Lotto.SessionManagerPublic}>(Lotto.SessionPublicPath)
            .borrow()
            ?? panic("Could not borrow SessionManager reference")
    }

    execute {
        self.sessionManagerRef.closeSessionAndDistribute(sessionID: sessionID, closer: self.closerAddress)
    }
}
`;
