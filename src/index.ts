import {
  Jupiter,
  TOKEN_LIST_URL,
} from "@jup-ag/core";
import { Connection, PublicKey } from "@solana/web3.js";
import fetch from "isomorphic-fetch";
import JSBI from "jsbi";
import { Token, ENV, swapToken, SOLANA_RPC_ENDPOINT, usdcToken, basePrice, discardWebhookId, discardWebhookToken, timeInterval } from "../constants";
import { WebhookClient, EmbedBuilder } from "discord.js";
//connect to discord webhook 
const webhookClient = new WebhookClient({ id: discardWebhookId, token: discardWebhookToken });
console.log("Connected to discord webhook!")



const getRoutes = async (jupiter: Jupiter, inputMint: Token, outputMint: Token) => {
  let inputAmountInSmallestUnits = getPriceInDecimals(1, inputMint);
  return await jupiter.computeRoutes({
    inputMint: new PublicKey(inputMint.address),
    outputMint: new PublicKey(outputMint.address),
    amount: JSBI.BigInt(inputAmountInSmallestUnits), // raw input amount of tokens
    slippageBps: 100,
    forceFetch: true,
  });
};

const getCoinQuote = async (inputMint: any, outputMint: any, amount: Number) => {
  return (await fetch(`https://quote-api.jup.ag/v1/quote?outputMint=${outputMint}&inputMint=${inputMint}&amount=${amount}&slippage=0.2`)).json();
}

const getPriceInDecimals = (amount, swapTokenInList) => {
  return swapTokenInList
    ? Math.round(amount * 10 ** swapTokenInList.decimals)
    : 0
}

const getPriceInNormalForm = (amount, token) => {
  return token && token.decimals ? amount / getPriceInDecimals(1, token) : 0;
}

const profitCalculator = async () => {
  try {
    let bestPrice = 0;
    const connection = new Connection(SOLANA_RPC_ENDPOINT); // Setup Solana RPC connection
    const tokens: Token[] = await (await fetch(TOKEN_LIST_URL[ENV])).json(); // Fetch token list from Jupiter API
    const swapTokenInList = tokens.find(e => e.address == swapToken);
    const usdcTokenInList = tokens.find(e => e.address == usdcToken);
    let inputAmountInSmallestUnits = getPriceInDecimals(1, swapTokenInList);
    //  Load Jupiter
    const jupiter = await Jupiter.load({
      connection,
      cluster: ENV,
    });

    if (usdcTokenInList && swapTokenInList) {
      setInterval(async () => {
        const routes: any = await Promise.all([
          getRoutes(jupiter, swapTokenInList, usdcTokenInList),
          getCoinQuote(swapToken, usdcToken, inputAmountInSmallestUnits)
        ]);
        if (routes && routes[0] && routes[1] && routes[0].routesInfos && routes[1].data && routes[1].data[0]) {
          const basePriceInSmallUnits = getPriceInDecimals(basePrice, usdcTokenInList);
          let bestObj = {
            price: 0,
            isRoute: false,
            deal: {}
          };
          if (parseInt(routes[0].routesInfos[0].outAmount) >= routes[1].data[0].outAmount) {
            bestObj.price = parseInt(routes[0].routesInfos[0].outAmount);
            bestObj.isRoute = true;
            bestObj.deal = routes[0].routesInfos[0];
          } else {
            bestObj.price = routes[1].data[0].outAmount;
            bestObj.isRoute = false;
            bestObj.deal = routes[1].data[0];
          };
          if (bestObj.price > basePriceInSmallUnits) {
            if(bestPrice < bestObj.price){
              bestPrice = bestObj.price;
              await sendMessage(bestPrice, swapTokenInList, usdcTokenInList);
            }
          }
        }
      }, timeInterval);
    }
  } catch (err) {
    console.log(err)
  }
};

const main = async () => {
  try {
    await profitCalculator();
  } catch (err) {
    console.log("Something went wrong reason is:", err)
  }
};

const sendMessage = async (price, token, usdcTokenInList) => {
  let message = `${token.symbol} price is ${getPriceInNormalForm(price, usdcTokenInList)} up.`;
  console.log("Found ",message)
  const embed = new EmbedBuilder()
    .setTitle(message)
    .setColor(0x00FFFF);

  webhookClient.send({
    content: 'Update in price: ',
    embeds: [embed],
  });
}


main();





