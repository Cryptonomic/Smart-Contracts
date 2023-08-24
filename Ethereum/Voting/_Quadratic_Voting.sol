// SPDX-License-Identifier: SEE LICENSE IN LICENSE


pragma solidity ^0.8.18;


import "@openzeppelin/contracts/utils/math/Math.sol";


//https://www.devoven.com/string-to-bytes32 --> converts from string to bytes32 format


contract Ballot{


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
voters[voter].voterCreditSpent == 0,
"The voter already spent their voting credits."
);
require(voters[voter].voterCreditBank == 0);
voters[voter].voterCreditBank = 100;
voters[voter].voterCreditSpent = 0;
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
function calcVoteCount() public {
for (uint q; q < proposals.length; q++)
proposals[q].voteCount = Math.sqrt(proposals[q].voteCreditCount);
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


function getVoterCreditBank(address voter) public view returns (uint256) {
return voters[voter].voterCreditBank;
}


function getVoterCreditSpent(address voter) public view returns (uint256) {
return voters[voter].voterCreditSpent;
}


function getVoteCount(bytes32 proposal) public view returns (uint256) {
//return proposals[proposalNames[j]].voteCount;
}
}