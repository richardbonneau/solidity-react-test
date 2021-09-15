pragma solidity ^0.6.0;

import "./Ownable.sol";
import "./Item.sol";

contract ItemManager is Ownable {
    enum SupplyChainState {
        CREATED,
        PAID,
        DELIVERED
    }

    struct S_Item {
        Item _item;
        string _identifier;
        uint256 _itemPrice;
        SupplyChainState _state;
    }

    mapping(uint256 => S_Item) public items;
    uint256 itemIndex;

    event SupplyChainStep(
        uint256 _itemIndex,
        uint256 _step,
        address _itemAddress
    );

    function createItem(string memory _identifier, uint256 _itemPrice)
        public
        onlyOwner
    {
        Item item = new Item(this, itemIndex, _itemPrice);
        items[itemIndex]._item = item;
        items[itemIndex]._identifier = _identifier;
        items[itemIndex]._state = SupplyChainState.CREATED;
        items[itemIndex]._itemPrice = _itemPrice;
        

        emit SupplyChainStep(
            itemIndex,
            uint256(SupplyChainState.CREATED),
            address(item)
        );

        itemIndex++;
    }

    function triggerPayment(uint256 _itemIndex) public payable {
        require(_itemIndex <= itemIndex, "Item index is invalid");

        S_Item memory itemToBuy = items[_itemIndex];
        require(msg.value >= itemToBuy._itemPrice, "Not enough funds");
        require(
            itemToBuy._state == SupplyChainState.CREATED,
            "Not enough funds"
        );

        itemToBuy._state = SupplyChainState.PAID;
        emit SupplyChainStep(
            itemIndex,
            uint256(SupplyChainState.PAID),
            address(items[itemIndex]._item)
        );
    }

    function triggerDelivery(uint256 _itemIndex) public onlyOwner {
        require(_itemIndex <= itemIndex, "Item index is invalid");
        S_Item memory itemToBuy = items[_itemIndex];

        itemToBuy._state = SupplyChainState.DELIVERED;

        emit SupplyChainStep(
            itemIndex,
            uint256(SupplyChainState.DELIVERED),
            address(items[itemIndex]._item)
        );
    }
}
