import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
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
    const data = await marketContract.fetchMyNFTs();

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
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
        };
        return item;
      })
    );
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
        <h1>No assets owned</h1>
      </div>
    );
  return (
    <div className="container">
      <div className="row">
        {nfts.map(
          (nft, i) => (
            console.log(nft),
            (
              <div className="col-sm-4" style={{ padding: "3rem" }}>
                <div
                  key={i}
                  className="card"
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                    maxWidth: "18rem",
                    backgroundColor: "rgba(255, 255, 255,.8)",
                  }}
                >
                  <img
                    src={nft.image}
                    className="card-img-top img-fluid d-block mx-auto"
                    style={{
                      hieght: "240px",
                      width: "240px",
                      margin: "1rem",
                      borderRadius: "15px",
                    }}
                  />
                  <div
                    className="card-body"
                    style={{ padding: "0 3rem 3rem 3rem" }}
                  >
                    <h3
                      className="card-title"
                      style={{
                        margin: "1rem",
                        color: "#0275d8",
                        textAlign: "center",
                      }}
                    >
                      {nft.name}
                    </h3>
                    <div
                      className="card-subtitle"
                      style={{ padding: "0.5rem", textAlign: "center" }}
                    >
                      <h6 className="text-gray-400">Price: {nft.price} ETH</h6>
                    </div>
                    <div className="card-text" style={{ padding: "0.3rem" }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
