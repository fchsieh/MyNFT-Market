import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "loaded" && !nfts.length)
    return (
      <div
        className="container p-5 "
        style={{
          color: "white",
          backgroundColor: "rgba(255,255,255,.2)",
          backdropFilter: "blur(25px)",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
          marginTop: "10%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h1>No items generated</h1>
      </div>
    );
  return (
    <div
      className="container p-4 mt-5"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(25px)",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        maxWidth: "50rem",
        textAlign: "center",
        borderRadius: "15px",
      }}
    >
      <div className="row" style={{ display: "flex" }}>
        <h2 className="mt-2 py-2">Items Created</h2>
        {nfts.map((nft, i) => (
          <div
            className="col-sm-4 pt-4"
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <div
              key={i}
              className="card"
              style={{
                backgroundColor: "rgba(255,255,255,.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={nft.image}
                className="card-img-top img-responsive d-block mx-auto m-3 p-1"
                style={{
                  maxHeight: "8rem",
                  width: "auto",
                }}
              />
              <div className="card-body p-4">
                <p
                  className="card-text py-4 p-1"
                  style={{
                    textAlign: "center",
                  }}
                >
                  Price: {nft.price} ETH
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        {Boolean(sold.length) && (
          <div className="row">
            <h2 className="mt-2 py-2">Items sold</h2>
            {sold.map((nft, i) => (
              <div
                className="col-sm-4 pt-4"
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <div
                  key={i}
                  className="card"
                  style={{
                    backgroundColor: "rgba(255,255,255,.8)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={nft.image}
                    className="card-img-top img-responsive d-block mx-auto m-3 p-1"
                    style={{
                      maxHeight: "8rem",
                      width: "auto",
                    }}
                  />
                  <div
                    className="card-body p-4"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <p
                      className="card-text py-4 p-1"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      Price: {nft.price} ETH
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
