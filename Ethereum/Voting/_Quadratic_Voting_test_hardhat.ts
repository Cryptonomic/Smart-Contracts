const { ethers } = require ('hardhat');
const { expect } = require ('chai');
const { Signer } = require ('ethers');


describe('Ballot Contract', () => {
let testBallot: any; // Replace 'any' with the contract type


let acc0: typeof Signer;
let acc1: typeof Signer;
let acc2: typeof Signer;
let acc3: typeof Signer;


beforeEach(async () => {
const Ballot = await ethers.getContractFactory('Ballot');
testBallot = await Ballot.deploy(['first', 'second', 'third']);
await testBallot.deployed();
const [accounts] = await ethers.getSigners();
acc0 = accounts[0];
acc1 = accounts[1];
acc2 = accounts[2];
acc3 = accounts[3];
});


it('should have the correct chairperson', async () => {
expect(await testBallot.chairperson).to.equal(acc0);
});


it('should give 100 credits to the chairperson', async () => {
expect(await testBallot.getVoterCreditBank(testBallot.chairperson).to.equal(100));
});


it('should start proposals with 0 votes', async () => {
for (let i = 0; i < 3; i++) {
expect(await testBallot.getVoteCount(await testBallot.testProposalNames(i))).to.equal(0);
}
});


it('should only allow chairperson to grant right to vote', async () => {
await testBallot.giveRightToVote(acc1);
expect(await testBallot.getVoterCreditBank(acc1).to.equal(0));
});


it('should give right to vote to eligible voters', async () => {
await testBallot.giveRightToVote(acc2);
expect(await testBallot.getVoterCreditBank(acc2).to.equal(100));
});


it('should not give right to vote to ineligible voters', async () => {
await testBallot.useVoterCredit(0);
let result = true;
try {
await testBallot.giveRightToVote(acc3);
} catch {
result = false;
}
expect(await testBallot.getVoterCreditBank(acc3)).to.equal(0);
expect(result).to.be.false;
});


it('should adjust values when voter credits are spent', async () => {
await testBallot.giveRightToVote(acc3);


await testBallot.useVoterCredit(0);
expect(await testBallot.getVoterCreditSpent(acc3)).to.equal(1);
expect(await testBallot.getVoterCreditBank(acc3)).to.equal(99);


await testBallot.useVoterCredit(1);
expect(await testBallot.getVoterCreditSpent(acc3)).to.equal(2);
expect(await testBallot.getVoterCreditBank(acc3)).to.equal(98);
});


it('should calculate vote count as square root of voter credits', async () => {
await testBallot.useVoterCredit(0);
await testBallot.useVoterCredit(0);
await testBallot.useVoterCredit(0);
await testBallot.useVoterCredit(0);
await testBallot.useVoterCredit(1);


await testBallot.calcVoteCount();


expect(await testBallot.getVoteCount(await testBallot.testProposalNames(0))).to.equal(2);
expect(await testBallot.getVoteCount(await testBallot.testProposalNames(1))).to.equal(1);
expect(await testBallot.getVoteCount(await testBallot.testProposalNames(2))).to.equal(0);
});


it('should choose the correct winning proposal', async () => {
await testBallot.useVoterCredit(0);
await testBallot.calcVoteCount();
const winningProposal = await testBallot.chooseWinningProposal();


expect(winningProposal).to.equal(0);
});

});