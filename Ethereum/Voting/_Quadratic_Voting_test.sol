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
    
    bytes32[] testProposalNames;
    Ballot testBallot = new Ballot(testProposalNames);
    address public acc0;  
    address public acc1;
    address public acc2;
    address public acc3;

    function beforeAll() public {
        testProposalNames.push("first");
        testProposalNames.push("second");
        testProposalNames.push("third");
        acc0 = TestsAccounts.getAccount(0);
        acc1 = TestsAccounts.getAccount(1);
        acc2 = TestsAccounts.getAccount(2);
        acc3 = TestsAccounts.getAccount(3);
    }
    
    function testMessageSenderIsChairperson() public returns (bool) {
        return Assert.equal(acc0, testBallot.chairperson(), "Message sender should be chairperson");
    }
    
    function testChairpersonGets100Credits() public returns (bool) {
        return Assert.equal(testBallot.getVoterCreditBank(testBallot.chairperson()), 100, "Chairperson should have 100 vote credits");
    }


    function testProposalsStartWith0Votes() public {
        for (uint i = 0; i < testProposalNames.length; i++) {
            Assert.equal(testBallot.getVoteCount(testProposalNames[i]), 0, "Proposal does not start with zero votes");
        }    
    }  

    function testOnlyChairpersonGrantsRightToVote() public returns (bool) {
        testBallot.giveRightToVote(acc1);
        return Assert.equal(testBallot.getVoterCreditBank(acc1), 0, "Only chairperson can assign right to vote");
    }
    
    function testRightToVoteGivenToEligibleVoter() public  {
        testBallot.giveRightToVote(acc2);
        if (testBallot.getVoterCreditSpent(acc2) == 0) {
            Assert.equal(testBallot.getVoterCreditBank(acc2), 100, "Voter should be given voter credits");
        }
    }

    function testRightToVoteNotGivenToIneligibleVoter() public returns (bool) {
        bool result;
        testBallot.useVoterCredit(0);
        try testBallot.giveRightToVote(acc3){
            result = Assert.equal(testBallot.getVoterCreditBank(acc3), 99, "Ineligible voter given credits");
        }
        catch (bytes memory) {
            result = false;
        }
        return result;
    }
 
    function testValuesAdjustedWhenVoterCreditSpent() public returns (bool) {
    testBallot.giveRightToVote(acc3);

            testBallot.useVoterCredit(0);
            Assert.equal(testBallot.getVoterCreditSpent(acc3), 1, "Voter credits not adjusted correctly");
            Assert.equal(testBallot.getVoterCreditBank(acc3), 99, "Voter credits not adjusted correctly");

            testBallot.useVoterCredit(1);
            Assert.equal(testBallot.getVoterCreditSpent(acc3), 2, "Voter credits not adjusted correctly");
            Assert.equal(testBallot.getVoterCreditBank(acc3), 98, "Voter credits not adjusted correctly");

        return true;
    }        
    
    function testVoteCountIsSquareRootOfVoterCredits() public {
        testBallot.useVoterCredit(0);
        testBallot.useVoterCredit(0);
        testBallot.useVoterCredit(0);
        testBallot.useVoterCredit(0);
        testBallot.useVoterCredit(1);

        testBallot.calcVoteCount();

        Assert.equal(testBallot.getVoteCount(testProposalNames[0]), 2, "Vote count calculation incorrect") &&
        Assert.equal(testBallot.getVoteCount(testProposalNames[1]), 1, "Vote count calculation incorrect") &&
        Assert.equal(testBallot.getVoteCount(testProposalNames[2]), 0, "Vote count calculation incorrect");
    }   
    
    function testCorrectWinningProposalChosen() public returns (bool) {
        testBallot.useVoterCredit(0);
        testBallot.calcVoteCount();
        uint winningProposal = testBallot.chooseWinningProposal();
        return Assert.equal(winningProposal, 0, "Incorrect winning proposal selected");
    }

}
    