// SPDX-License-Identifier: SEE LICENSE IN LICENSE

pragma solidity ^0.8.18;

contract Ballot {

    struct Voter{
        uint voterCreditBank;
        uint voterCreditSpent;
        uint vote;
    }

    struct Proposal{
        bytes32 name;
        uint voteCount;
        uint voteCreditCount;
    }

    address public chairperson;
    
    mapping(address => Voter) public voters;

    Proposal[] public proposals;

    //assigns chairperson and allows for creation of proposals
    constructor (bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].voterCreditBank = 100;

        for (uint i = 0; i < proposalNames.length; i++){
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0, voteCreditCount: 0
            }));
        }
    }

    //allows chairperson to give the right to vote
    function giveRightToVote(address voter) public {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            voters[voter].voterCreditSpent != 100,
            "The voter already spent their voting credits."
        );
        require(voters[voter].voterCreditBank == 0);
        voters[voter].voterCreditBank = 100;
        voters[voter].voterCreditSpent = 0;
    }

    //Takes square root of input value
    function sqrt(uint y) internal pure returns (uint z) {
    if (y > 3) {
        z = y;
        uint x = y / 2 + 1;
        while (x < z) {
            z = x;
            x = (y / x + x) / 2;
        }
    } else if (y != 0) {
        z = 1;
    }
    }

    //allows voters to spend credits on proposal of their choice
    function useVoterCredit (uint proposal) public{
        Voter storage sender = voters[msg.sender];
        require(sender.voterCreditBank != 0, "Has no right to vote.");
        require(sender.voterCreditSpent !=100, "Already spent all voter credits.");
        sender.voterCreditSpent++;
        sender.vote = proposal;
        sender.voterCreditBank = 100 - sender.voterCreditSpent;
        proposals[proposal].voteCreditCount++;
    }
    
    //implements quadratic voting structure by taking square root of voting credits in each proposal
    function getVoteCount() public {
        for (uint q; q < proposals.length; q++)
            proposals[q].voteCount = sqrt(proposals[q].voteCreditCount);
    }
    
    //chooses proposal as the one with highest vote count
    function chooseWinningProposal() public view returns (uint winningProposal){
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal = p;
            }
        }
    }

    //displays name of winning proposal
    function winnerName() public view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[chooseWinningProposal()].name;
    }

}

//converts from string to bytes32 format
contract converter {

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
            if (tempEmptyStringTest.length == 0) {
                return 0x0;
            }

        assembly {
            result := mload(add(source, 32))
        }
    }
}