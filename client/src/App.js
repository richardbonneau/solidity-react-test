import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, itemManager: null, item: null, cost: "", identifier: "" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log("networkId", ItemManagerContract.networks);
      const itemManager = new web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[networkId] && ItemManagerContract.networks[networkId].address
      );
      console.log(
        "ItemContract.networks[networkId].address",
        ItemManagerContract.networks[networkId].address
      );
      const item = new web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[networkId] && ItemContract.networks[networkId].address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToPaymentEvent(itemManager);
      this.setState({ web3, accounts, itemManager, item });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  onChangeInput = (e) => {
    const target = e.target;
    const value = e.type === "checkbox" ? target.checked : target.value;
    console.log("value", value, "target.name", target.name, this.state);
    this.setState({ [target.name]: value });
  };

  onSubmit = async (e) => {
    const { identifier, cost, itemManager, accounts } = this.state;

    let result = await itemManager.methods.createItem(identifier, cost).send({ from: accounts[0] });
    console.log(result);
  };

  listenToPaymentEvent = async (itemManager) => {
    itemManager.events.SupplyChainStep().on("data", async function (e) {
      console.log("supplychainstep", e,e.returnValues._itemIndex);
      let itemObj = await itemManager.methods.items(e.returnValues._itemIndex).call();
      console.log("itemObj",itemObj)
    });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Items</h2>
        <h2>Add Item</h2>

        <input
          name="identifier"
          placeholder="identifier"
          value={this.state.identifier}
          onChange={this.onChangeInput}
        />
        <div />
        <input
          name="cost"
          placeholder="cost"
          value={this.state.cost}
          onChange={this.onChangeInput}
        />
        <div />
        <input type="submit" onClick={this.onSubmit} />
      </div>
    );
  }
}

export default App;
