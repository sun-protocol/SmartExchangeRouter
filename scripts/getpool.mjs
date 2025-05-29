import { initTronWeb } from './tron.mjs';
import config from './config.js';
const { mainnet, nile } = config;

console.log("1");
const tronWeb = await initTronWeb(nile);
let V3routerAbi = [{"stateMutability":"Nonpayable","type":"Constructor"},{"inputs":[{"indexed":true,"name":"fee","type":"uint24"},{"indexed":true,"name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"Event"},{"inputs":[{"indexed":true,"name":"oldOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"Event"},{"inputs":[{"indexed":true,"name":"token0","type":"address"},{"indexed":true,"name":"token1","type":"address"},{"indexed":true,"name":"fee","type":"uint24"},{"name":"tickSpacing","type":"int24"},{"name":"pool","type":"address"},{"name":"poolLength","type":"uint256"}],"name":"PoolCreated","type":"Event"},{"outputs":[{"type":"address"}],"inputs":[{"type":"uint256"}],"name":"allPools","stateMutability":"view","type":"function"},{"outputs":[{"type":"uint256"}],"name":"allPoolsLength","stateMutability":"view","type":"function"},{"outputs":[{"name":"pool","type":"address"}],"inputs":[{"name":"tokenA","type":"address"},{"name":"tokenB","type":"address"},{"name":"fee","type":"uint24"}],"name":"createPool","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"fee","type":"uint24"},{"name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"int24"}],"inputs":[{"type":"uint24"}],"name":"feeAmountTickSpacing","stateMutability":"view","type":"function"},{"outputs":[{"type":"bytes32"}],"name":"getPairHash","stateMutability":"pure","type":"function"},{"outputs":[{"type":"address"}],"inputs":[{"type":"address"},{"type":"address"},{"type":"uint24"}],"name":"getPool","stateMutability":"view","type":"function"},{"outputs":[{"type":"address"}],"name":"owner","stateMutability":"view","type":"function"},{"outputs":[{"name":"factory","type":"address"},{"name":"token0","type":"address"},{"name":"token1","type":"address"},{"name":"fee","type":"uint24"},{"name":"tickSpacing","type":"int24"}],"name":"parameters","stateMutability":"view","type":"function"},{"inputs":[{"name":"_owner","type":"address"}],"name":"setOwner","stateMutability":"Nonpayable","type":"Function"}];

const router_v3 = await tronWeb.contract(V3routerAbi, nile.v3Factory);
const pooladderss = await router_v3.getPool("TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf", "TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a", 500).call();
console.log("1");

console.log(pooladderss);
const add = await tronWeb.address.fromHex(pooladderss);
console.log(add);
