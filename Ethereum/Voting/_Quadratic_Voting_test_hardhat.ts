const { ethers } = require("hardhat");
import { expect } from 'chai';
import { Signer } from 'ethers';

describe('Ballot Test', () => {
  let testBallot: any; // Replace 'any' with the contract type

  let acc0: Signer;
  let acc1: Signer;
  let acc2: Signer;
  let acc3: Signer;

  beforeEach(async () => {
    const Ballot = await ethers.getContractFactory('Ballot');
    testBallot = await Ballot.deploy(['first', 'second', 'third']);
    await testBallot.deployed();

    const accounts = await ethers.getSigners();
    acc0 = accounts[0];
    acc1 = accounts[1];
    acc2 = accounts[2];
    acc3 = accounts[3];
  });

  it('should have the correct chairperson', async () => {
    expect(await testBallot.chairperson()).to.equal(await acc0.getAddress());
  });

  it('should give 100 credits to the chairperson', async () => {
    expect(await testBallot.getVoterCreditBank(await acc0.getAddress())).to.equal(100);
  });

  it('should start proposals with 0 votes', async () => {
    for (let i = 0; i < 3; i++) {
      expect(await testBallot.getVoteCount(await testBallot.testProposalNames(i))).to.equal(0);
    }
  });

  it('should only allow chairperson to grant right to vote', async () => {
    await testBallot.giveRightToVote(await acc1.getAddress());
    expect(await testBallot.getVoterCreditBank(await acc1.getAddress())).to.equal(0);
  });

  it('should give right to vote to eligible voters', async () => {
    await testBallot.giveRightToVote(await acc2.getAddress());
    expect(await testBallot.getVoterCreditBank(await acc2.getAddress())).to.equal(100);
  });

  it('should not give right to vote to ineligible voters', async () => {
    await testBallot.useVoterCredit(0);
    let result = true;
    try {
      await testBallot.giveRightToVote(await acc3.getAddress());
    } catch {
      result = false;
    }
    expect(await testBallot.getVoterCreditBank(await acc3.getAddress())).to.equal(0);
    expect(result).to.be.false;
  });

  it('should adjust values when voter credits are spent', async () => {
    await testBallot.giveRightToVote(await acc3.getAddress());

    await testBallot.useVoterCredit(0);
    expect(await testBallot.getVoterCreditSpent(await acc3.getAddress())).to.equal(1);
    expect(await testBallot.getVoterCreditBank(await acc3.getAddress())).to.equal(99);

    await testBallot.useVoterCredit(1);
    expect(await testBallot.getVoterCreditSpent(await acc3.getAddress())).to.equal(2);
    expect(await testBallot.getVoterCreditBank(await acc3.getAddress())).to.equal(98);
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