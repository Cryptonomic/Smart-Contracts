// SPDX-License-Identifier: APACHE
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

// File: openzeppelin-contracts/contracts/math/SafeMath.sol
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        require(c >= a, "SafeMath add wrong value");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath sub wrong value");
        return a - b;
    }
}

// File: openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol
contract ReentrancyGuard {
    bool private _notEntered;

    constructor() {
        _notEntered = true;
    }

    modifier nonReentrant() {
        require(_notEntered, "ReentrancyGuard: reentrant call");
        _notEntered = false;
        _;
        _notEntered = true;
    }
}

contract AtomicSwap is ReentrancyGuard {
    using SafeMath for uint256;

    enum State {Empty, Waiting, Initiated}
    
    struct Swap {
        bytes32 prevHash;
        bytes32 nextHash;
        bytes32 hashedSecret;
        address payable initiator;
        address payable participant;
        uint256 refundTimestamp;
        uint256 value;
        State state;
        string initiator_tez;
    }
    
    // first swap in the swap list
    bytes32 public head;
    // count of swaps
    uint256 public count;
    // admin account
    address payable admin;
    // contract active state
    bool public active;

    // swaps
    mapping(bytes32 => Swap) public swaps;
    
    event Redeemed(
        bytes32 indexed _hashedSecret,
        bytes32 _secret
    );
    
    constructor(){
        head=bytes32(0);
        count=0;
        active=false;
        admin=msg.sender;
    }

    modifier onlyByInitiator(bytes32 _hashedSecret) {
        require(
            msg.sender == swaps[_hashedSecret].initiator,
            "sender is not the initiator"
        );
        _;
    }

    modifier onlyByAdmin() {
        require(
            msg.sender == admin,
            "sender is not the admin"
        );
        _;
    }

    modifier isInitiatable(
        bytes32 _hashedSecret,
        address _participant,
        uint256 _refundTimestamp
    ) {
        require(_participant != address(0), "invalid participant address");
        require(
            swaps[_hashedSecret].state == State.Empty,
            "swap for this hash is already initiated"
        );
        require(
            block.timestamp < _refundTimestamp,
            "refundTimestamp has already come"
        );
        _;
    }

    modifier checkState(bytes32 _hashedSecret, State state) {
        require(
            swaps[_hashedSecret].state == state,
            "state mismatch"
        );
        _;
    }


    modifier isRedeemable(bytes32 _hashedSecret, bytes32 _secret) {
        require(
            block.timestamp < swaps[_hashedSecret].refundTimestamp,
            "refundTimestamp has already come"
        );
        require(
            sha256(abi.encodePacked(sha256(abi.encodePacked(_secret)))) ==
                _hashedSecret,
            "secret is not correct"
        );
        _;
    }

    modifier isRefundable(bytes32 _hashedSecret) {
        require(
            swaps[_hashedSecret].state == State.Waiting || swaps[_hashedSecret].state == State.Initiated ,
            "state mismatch"
        );
        require(
            block.timestamp >= swaps[_hashedSecret].refundTimestamp,
            "refundTimestamp has not come"
        );
        _;
    }
    
    modifier contractIsActive(){
        require(active==true, "contract is deactivated");
        _;
    }

    function toggleContractState(bool _active) public onlyByAdmin{
        active=_active;
    }

    function initiateWait(
        bytes32 _hashedSecret,
        string memory _initiator_tez,
        uint256 _refundTimestamp
    )
        public
        payable
        nonReentrant
        contractIsActive
        isInitiatable(_hashedSecret, msg.sender, _refundTimestamp)
    {
        swaps[_hashedSecret].value = msg.value;
        swaps[_hashedSecret].hashedSecret = _hashedSecret;
        swaps[_hashedSecret].participant = msg.sender;
        swaps[_hashedSecret].initiator = msg.sender;
        swaps[_hashedSecret].initiator_tez = _initiator_tez;
        swaps[_hashedSecret].refundTimestamp = _refundTimestamp;
        swaps[_hashedSecret].state = State.Waiting;
        swaps[_hashedSecret].prevHash = bytes32(0);
        swaps[_hashedSecret].nextHash = bytes32(0);
        
        
        if(head==bytes32(0)){
            head=_hashedSecret;
        }
        else{
            swaps[_hashedSecret].nextHash = head;
            swaps[head].prevHash=_hashedSecret;
            head=_hashedSecret;
        }
        count+=1;
    }
    
    function addCounterParty(bytes32 _hashedSecret,address payable _participant)
        public
        contractIsActive
        checkState(_hashedSecret, State.Waiting)
        onlyByInitiator(_hashedSecret)
    {
        swaps[_hashedSecret].participant = _participant;
        swaps[_hashedSecret].state = State.Initiated;
           
    }

    function redeem(bytes32 _hashedSecret, bytes32 _secret)
        public
        nonReentrant
        checkState(_hashedSecret, State.Initiated)
        isRedeemable(_hashedSecret, _secret)
    {
        swaps[_hashedSecret].participant.transfer(swaps[_hashedSecret].value);
        
        if(swaps[_hashedSecret].prevHash == bytes32(0) && swaps[_hashedSecret].nextHash == bytes32(0)){
            head=bytes32(0);
        }else if(swaps[_hashedSecret].prevHash == bytes32(0)){
            head=swaps[_hashedSecret].nextHash;
            swaps[head].prevHash=bytes32(0);
        }else if(swaps[_hashedSecret].nextHash == bytes32(0)){
            swaps[swaps[_hashedSecret].prevHash].nextHash=bytes32(0);
        }else{
             swaps[swaps[_hashedSecret].prevHash].nextHash=swaps[_hashedSecret].nextHash;
             swaps[swaps[_hashedSecret].nextHash].prevHash=swaps[_hashedSecret].prevHash;
        }

        delete swaps[_hashedSecret];
        count-=1;
        emit Redeemed(
            _hashedSecret,
            _secret
        );
    }

    function refund(bytes32 _hashedSecret)
        public
        isRefundable(_hashedSecret)
    {
        swaps[_hashedSecret].initiator.transfer(swaps[_hashedSecret].value);
    
         if(swaps[_hashedSecret].prevHash == bytes32(0) && swaps[_hashedSecret].nextHash == bytes32(0)){
            head=bytes32(0);
        }else if(swaps[_hashedSecret].prevHash == bytes32(0)){
            head=swaps[_hashedSecret].nextHash;
            swaps[head].prevHash=bytes32(0);
        }else if(swaps[_hashedSecret].nextHash == bytes32(0)){
            swaps[swaps[_hashedSecret].prevHash].nextHash=bytes32(0);
        }else{
             swaps[swaps[_hashedSecret].prevHash].nextHash=swaps[_hashedSecret].nextHash;
             swaps[swaps[_hashedSecret].nextHash].prevHash=swaps[_hashedSecret].prevHash;
        }

        delete swaps[_hashedSecret];
        count-=1;
    }

    function getAllSwaps()public view returns(Swap[] memory){
        Swap[] memory sps = new Swap[](count);
        if(head==bytes32(0))
            return sps;
        Swap memory sp = swaps[head];
        uint i=0;
        while(sp.nextHash!=bytes32(0)){
            sps[i] = sp;
            i+=1;
            sp=swaps[sp.nextHash];
        }
        sps[i]=sp;
        return sps;
    }
    
    // for testing, not to be included in deployed contract
    function stringToSecret(string memory source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function stringToHashedSecret(string memory source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
        // result = sha256(abi.encodePacked(sha256(abi.encodePacked(source))));
    }
}