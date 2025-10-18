import Test
import "Lotto"

access(all) let admin = Test.getAccount(0x0000000000000007)

access(all) fun setup() {
    let err = Test.deployContract(
        name: "Lotto",
        path: "../contracts/Lotto.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testContractInitialization() {
    // Test that contract was initialized correctly
    Test.assertEqual(5.0, Lotto.platformFeePercentage * 100.0)  // 5%
    Test.assertEqual(10.0, Lotto.creatorFeePercentage * 100.0)  // 10%
    Test.assertEqual(UInt64(3), Lotto.maxTicketsPerWallet)
    Test.assertEqual(UInt64(1), Lotto.nextSessionID)
}

access(all) fun testCreateSessionManager() {
    let sessionManager <- Lotto.createSessionManager()
    
    // Verify session manager was created
    Test.assert(sessionManager != nil)
    
    // Verify no session exists yet
    Test.assertEqual(nil, sessionManager.getSessionID())
    Test.assertEqual(false, sessionManager.isActive())
    
    destroy sessionManager
}

access(all) fun testCreateSession() {
    // Create a session manager
    let creator = Test.getAccount(0x0000000000000008)
    let sessionManager <- Lotto.createSessionManager()
    
    // Calculate end time (1 hour from now)
    let currentTime = getCurrentBlock().timestamp
    let endTime = currentTime + 3600.0
    
    // Create a session
    sessionManager.createSession(
        creator: creator.address,
        ticketPrice: 1.0,
        endTime: endTime
    )
    
    // Verify session was created
    Test.assertEqual(UInt64(1), sessionManager.getSessionID()!)
    Test.assertEqual(creator.address, sessionManager.getCreator()!)
    Test.assertEqual(1.0, sessionManager.getTicketPrice()!)
    Test.assertEqual(endTime, sessionManager.getEndTime()!)
    Test.assertEqual(true, sessionManager.isActive())
    Test.assertEqual(0.0, sessionManager.getTotalPool())
    Test.assertEqual(UInt64(0), sessionManager.getTotalTickets())
    
    destroy sessionManager
}

access(all) fun testSessionIDIncreases() {
    let creator = Test.getAccount(0x0000000000000009)
    let sessionManager1 <- Lotto.createSessionManager()
    let sessionManager2 <- Lotto.createSessionManager()
    
    let currentTime = getCurrentBlock().timestamp
    let endTime = currentTime + 3600.0
    
    sessionManager1.createSession(
        creator: creator.address,
        ticketPrice: 1.0,
        endTime: endTime
    )
    
    sessionManager2.createSession(
        creator: creator.address,
        ticketPrice: 2.0,
        endTime: endTime
    )
    
    // Verify session IDs are different
    Test.assertEqual(UInt64(2), sessionManager1.getSessionID()!)
    Test.assertEqual(UInt64(3), sessionManager2.getSessionID()!)
    
    destroy sessionManager1
    destroy sessionManager2
}
