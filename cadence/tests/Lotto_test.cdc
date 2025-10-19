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
    Test.assertEqual(nil, sessionManager.getActiveSessionID())
    Test.assertEqual(0, sessionManager.getTotalSessionsCount())
    
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
    Test.assertEqual(UInt64(1), sessionManager.getActiveSessionID()!)
    Test.assertEqual(1, sessionManager.getTotalSessionsCount())
    
    // Get active session and verify
    let sessionInfo = sessionManager.getActiveSession()!
    Test.assertEqual(UInt64(1), sessionInfo.sessionID)
    Test.assertEqual(creator.address, sessionInfo.creator)
    Test.assertEqual(1.0, sessionInfo.ticketPrice)
    Test.assertEqual(endTime, sessionInfo.endTime)
    Test.assertEqual(true, sessionInfo.isActive)
    Test.assertEqual(0.0, sessionInfo.totalPool)
    Test.assertEqual(UInt64(0), sessionInfo.totalTickets)
    
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
    Test.assertEqual(UInt64(2), sessionManager1.getActiveSessionID()!)
    Test.assertEqual(UInt64(3), sessionManager2.getActiveSessionID()!)
    
    destroy sessionManager1
    destroy sessionManager2
}

access(all) fun testSessionHistory() {
    let creator = Test.getAccount(0x000000000000000A)
    let sessionManager <- Lotto.createSessionManager()
    
    let currentTime = getCurrentBlock().timestamp
    let endTime = currentTime + 3600.0
    
    // Create first session
    sessionManager.createSession(
        creator: creator.address,
        ticketPrice: 1.0,
        endTime: endTime
    )
    
    let firstSessionID = sessionManager.getActiveSessionID()!
    
    // Archive the first session
    sessionManager.archiveActiveSession()
    
    // Verify no active session
    Test.assertEqual(nil, sessionManager.getActiveSessionID())
    
    // Create second session
    sessionManager.createSession(
        creator: creator.address,
        ticketPrice: 2.0,
        endTime: endTime + 7200.0
    )
    
    let secondSessionID = sessionManager.getActiveSessionID()!
    
    // Verify we have 2 sessions total
    Test.assertEqual(2, sessionManager.getTotalSessionsCount())
    
    // Verify we can get both sessions
    let firstSession = sessionManager.getSessionByID(sessionID: firstSessionID)!
    let secondSession = sessionManager.getSessionByID(sessionID: secondSessionID)!
    
    Test.assertEqual(1.0, firstSession.ticketPrice)
    Test.assertEqual(2.0, secondSession.ticketPrice)
    Test.assertEqual(false, firstSession.isActive)  // archived
    Test.assertEqual(true, secondSession.isActive)   // active
    
    // Get all sessions
    let allSessions = sessionManager.getAllSessions()
    Test.assertEqual(2, allSessions.length)
    
    // Get completed sessions
    let completedSessions = sessionManager.getCompletedSessions()
    Test.assertEqual(1, completedSessions.length)
    
    destroy sessionManager
}
