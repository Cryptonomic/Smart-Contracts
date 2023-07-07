// SPDX-License-Identifier: GPL-3.0
        
pragma solidity >=0.4.22 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol"; 

// This import is required to use custom transaction context
// Although it may fail compilation in 'Solidity Compiler' plugin
// But it will work fine in 'Solidity Unit Testing' plugin
import "remix_accounts.sol";
import "../contracts/_Quadratic_Voting.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract testSuite {
    
    Ballot testBallot;

    bytes32[] testProposalNames;

    address acc0;  
    address acc1;
    address acc2;
    address acc3;

    function beforeAll() public {
        testProposalNames[0] = 0x6669727374000000000000000000000000000000000000000000000000000000;
        testProposalNames[1] = 0x7365636f6e640000000000000000000000000000000000000000000000000000;
        testProposalNames[2] = 0x7468697264000000000000000000000000000000000000000000000000000000;
        testBallot = new Ballot(testProposalNames);
        acc0 = TestsAccounts.getAccount(0);
        acc1 = TestsAccounts.getAccount(1);
        acc2 = TestsAccounts.getAccount(2);
        acc3 = TestsAccounts.getAccount(3);
    }
    
    function testMessageSenderIsChairperson() public returns (bool) {
        return Assert.equal(testBallot.chairperson(), acc0, "Message sender is not chairperson");
    }
    
    function testChaipersonGets100Credits() public returns (bool) {
        return Assert.equal(testBallot.getVoterCreditBank(acc0), 100, "Chairperson assigned wrong number of votes");
    }


    /*function testProposalsStartWith0Votes() public returns (bool) {
        return Assert.equal(testBallot.proposals(testProposalNames[1]).voteCreditCount, 0, "Proposal starts with wrong number of votes");
    }  

    function testRightToVoteGivenToEligibleVoter() public returns (bool) {
        testBallot.voters[acc1].voterCreditSpent = 0;
        return Assert.equal(testBallot.voters[acc0].voterCreditBank, 100, "Voter should be given voter credits");
    }

    function testRightToVoteNotGivenToIneligibleVoter() public returns (string memory) {
        testBallot.voters[acc1].voterCreditSpent = 20;
        return "The voter already spent their voting credits.";
    }
 
    function testValuesAdjustedWhenVoterCreditSpent() public returns (bool) {

    }        
    
    function testVoteCountIsSquareRootOfVoterCredits() public returns (bool) {
        return Assert.equal(testBallot.proposals[testProposalNames[1]].voteCount, Math.sqrt(testBallot.proposals[testProposalNames[2]].voteCreditCount), "Square root function not working as intended");
    }   
    
    function testCorrectWinningProposalChosen() public returns (bool) {

    }*/

}
    