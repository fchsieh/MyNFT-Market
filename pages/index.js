import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Head from "next/head";

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
  const [nfts, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNFTs(items);
    setLoadingState("loaded");
  }

  async function buyNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    );
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === "loaded" && !nfts.length) {
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
        <h1>No items in the marketplace</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        justifyContent: "center",
        display: "flex",
      }}
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>My NFT Marketplace</title>
      </Head>
      <div className="container pt-5">
        <div className="row">
          {nfts.map((nft, i) => (
            <div className="col-sm-4 p-4">
              <div
                key={i}
                className="card"
                style={{
                  maxWidth: "18rem",
                  backgroundColor: "rgba(255,255,255,.8)",
                }}
              >
                <img
                  src={nft.image}
                  className="card-img-top img-responsive d-block mx-auto m-3 p-1"
                  style={{
                    maxHeight: "10rem",
                    width: "auto",
                  }}
                />
                <div className="card-body">
                  <h3
                    className="card-title p-1"
                    style={{
                      color: "#0275d8",
                      textAlign: "center",
                    }}
                  >
                    {nft.name}
                  </h3>
                  <h6
                    className="card-subtitle text-muted p-1"
                    style={{
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    Price: {nft.price} ETH
                  </h6>
                  <div className="card-text p-3">
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                  <a
                    className="btn btn-primary"
                    onClick={() => buyNFT(nft)}
                    style={{ width: "5rem" }}
                  >
                    Buy
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
