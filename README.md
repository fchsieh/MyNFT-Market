# My NFT Marketplace

## Demo
https://www.youtube.com/watch?v=2xIWY32x-j8

## Run App
0. Generate your Metamask wallet and paste the private key into `.secret` file at the root directory
1. Start local hardhat node

```shell
npx hardhat node
```

2. Deploy contracts to the local network

```shell
npx hardhat run .\scripts\deploy.js --network localhost
```

3. Copy the market address and NFT address to `config.js` file
4. Start the app

```
npm run dev
```
