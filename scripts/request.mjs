import { initTronWeb } from './tron.mjs';
import config from './config.js';
const { mainnet, nile } = config;
import utils from 'web3-utils';
const { toBN, toWei } = utils;

const tronWeb = await initTronWeb(nile);

const router = await tronWeb.contract().at(nile.smartRouter);
const trx = '0x0000000000000000000000000000000000000000';
let result = await router
  .swapExactETHForTokens(
    1000000,
    1,
    [trx, nile.usdtToken, nile.usdjToken, nile.tusdToken],
    ['v1', 'v2', 'old3pool'],
    [2, 1, 1],
    'TF5MekHgFz6neU7zTpX4h2tha5miPDUj3z',
    Math.floor(Date.now() / 1000 + 86400),
  )
  .send({ callValue: 1000000 });
console.log(result);
