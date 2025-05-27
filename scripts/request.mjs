import { initTronWeb } from './tron.mjs';
import config from './config.js';
const { mainnet, nile } = config;
import utils from 'web3-utils';
const { toBN, toWei } = utils;

const tronWeb = await initTronWeb(nile);
let smartrouterAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_old3pool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_usdcPool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_v2Router",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_v1Foctroy",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_usdt",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_usdj",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_tusd",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_usdc",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_psmUsdd",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_v3Router",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "AddPool",
    "type": "event",
    "stateMutability": "nonpayable"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "ChangePool",
    "type": "event",
    "stateMutability": "nonpayable"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "amountsOut",
        "type": "uint256[]"
      }
    ],
    "name": "SwapExactETHForTokens",
    "type": "event",
    "stateMutability": "nonpayable"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "amountsOut",
        "type": "uint256[]"
      }
    ],
    "name": "SwapExactTokensForTokens",
    "type": "event",
    "stateMutability": "nonpayable"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "originOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "TransferAdminship",
    "type": "event",
    "stateMutability": "nonpayable"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "originOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "TransferOwnership",
    "type": "event",
    "stateMutability": "nonpayable"
  },
  {
    "stateMutability": "payable",
    "type": "fallback",
    "name": "fallback"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "psmUsdd",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "v1Factory",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "v2Router",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "v3Router",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive",
    "name": "receive"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "transferAdminship",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "retrieve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "poolVersion",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "addPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "poolVersion",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "addUsdcPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "poolVersion",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "gemJoin",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "addPsmPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "poolVersion",
        "type": "string"
      }
    ],
    "name": "isUsdcPool",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "poolVersion",
        "type": "string"
      }
    ],
    "name": "isPsmPool",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "changePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "path",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "poolVersion",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "versionLen",
        "type": "uint256[]"
      },
      {
        "internalType": "uint24[]",
        "name": "fees",
        "type": "uint24[]"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct SmartExchangeRouter.SwapData",
        "name": "data",
        "type": "tuple"
      }
    ],
    "name": "swapExactInput",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "amountsOut",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountMinimum",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "unwrapWTRX",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountMax",
        "type": "uint256"
      }
    ],
    "name": "warpWTRX",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];
const router = await tronWeb.contract(smartrouterAbi, nile.smartRouter);
const trx = '0x0000000000000000000000000000000000000000';
let result = await router
  .swapExactInput(
    [trx, nile.usdtToken, nile.usdjToken, nile.tusdToken],
    ['v1', 'v2', 'old3pool'],
    [2, 1, 1],
    [0,0,0,0],
    [1000000,1,
    'TF5MekHgFz6neU7zTpX4h2tha5miPDUj3z',
    Math.floor(Date.now() / 1000 + 86400)],
  )
  .send({ callValue: 1000000 });
console.log(result);
