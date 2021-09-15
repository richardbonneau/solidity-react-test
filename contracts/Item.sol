pragma solidity ^0.6.0;

import "./ItemManager.sol";

contract Item {
    uint256 index;
    uint256 itemPrice;
    uint256 pricePaid;

    ItemManager parentContract;

    constructor(
        ItemManager _parentContract,
        uint256 _index,
        uint256 _itemPrice
    ) public {
        index = _index;
        itemPrice = _itemPrice;
        parentContract = _parentContract;
    }

    receive() external payable {
        require(msg.value == itemPrice,"Wrong price");
        require(pricePaid == 0,"Item is already paid");
        pricePaid += msg.value;
        (bool success, ) = address(parentContract).call.value(msg.value)(
            abi.encodeWithSignature("triggerPayment(uint256)", index)
        );
        require(success, "Payment failed");
    }

    fallback() external {}
}
