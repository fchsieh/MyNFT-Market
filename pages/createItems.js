import React, { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3Modal";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const createItems = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log("received: " + prog),
      });
      const url = "https://ipfs.infura.io/ipfs/" + added.path;
      setFileUrl(url);
    } catch (e) {
      console.log(e);
    }
  }

  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      const url = "https://ipfs.infura.io/ipfs/" + added.path;
      createSale(url);
    } catch (e) {
      console.log("Error uploading file: ", e);
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();

    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  return (
    <div
      className="container"
      style={{
        padding: "5rem",
        marginTop: "5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: "50rem",
        backgroundColor: "rgba(255,255,255,.1)",
        backdropFilter: "blur(25px)",
        borderRadius: "15px",
      }}
    >
      <div className="row">
        <input
          className="border rounded"
          placeholder="Asset Name"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
          style={{ marginTop: "1.5rem", padding: "1rem" }}
        />
        <textarea
          className="border rounded"
          placeholder="Asset Description"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
          style={{ marginTop: "1.5rem", padding: "1rem" }}
        />
        <input
          className="border rounded"
          placeholder="Asset price in ETH"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
          style={{ marginTop: "1.5rem", padding: "1rem" }}
        />
        <input
          className="rounded border form-control center"
          type="file"
          name="Asset"
          onChange={onChange}
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            paddingLeft: "3rem",
          }}
        />
        <div
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          {fileUrl && (
            <img
              className="img-fluid"
              src={fileUrl}
              style={{
                maxHeight: "100%",
                maxWidth: "180px",
                padding: "0.5rem",
                backgroundColor: "white",
                marginTop: "2rem",
              }}
            />
          )}
        </div>
        <div
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <a
            className="btn btn-primary"
            onClick={createMarket}
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              width: "150px",
              textAlign: "center",
            }}
          >
            Create NFT
          </a>
        </div>
      </div>
    </div>
  );
};

export default createItems;
