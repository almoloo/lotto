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
