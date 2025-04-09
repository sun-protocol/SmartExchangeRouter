import { initTronWeb } from './tron.mjs';
import config from './config.js';
const { mainnet, nile } = config;

let smartrouterAbi = [
  {
    "inputs": [
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
        "name": "_psmUsdd",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_v3Router",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_wtrx",
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
    "name": "WTRX",
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
  }
];
const cfg = mainnet;
const tronWeb = await initTronWeb(cfg);

const router = await tronWeb.contract(smartrouterAbi,cfg.smartRouter);
await router
  .addPool('2pool', cfg.usdd2pool, [cfg.usddToken, cfg.usdtToken])
  .send();
await router
  .addPsmPool('usdtpsm', cfg.usdtpsmpool.psm, cfg.usdtpsmpool.gemJoin, [
    cfg.psmUsddToken,
    cfg.usdtToken,
  ])
  .send();
await router
  .addPsmPool('usdcpsm', cfg.usdcpsmpool.psm, cfg.usdcpsmpool.gemJoin, [
    cfg.psmUsddToken,
    cfg.usdcToken,
  ])
  .send();
await router
  .addPsmPool('tusdpsm', cfg.tusdpsmpool.psm, cfg.tusdpsmpool.gemJoin, [
    cfg.psmUsddToken,
    cfg.tusdToken,
  ])
  .send();
await router
  .addPsmPool('usdjpsm', cfg.usdjpsmpool.psm, cfg.usdjpsmpool.gemJoin, [
    cfg.psmUsddToken,
    cfg.usdjToken,
  ])
  .send();
await router
  .addPool('2pooltusdusdt', cfg.tusdusdt2pool, [cfg.tusdToken, cfg.usdtToken])
  .send();
await router
  .addUsdcPool('usdc2pooltusdusdt', cfg.usdc2pooltusdusdt, [
    cfg.usdcToken,
    cfg.tusdToken,
    cfg.usdtToken,
  ])
  .send();
await router
  .addUsdcPool('usdd2pooltusdusdt', cfg.usdd2pooltusdusdt, [
    cfg.usddToken,
    cfg.tusdToken,
    cfg.usdtToken,
  ])
  .send();
await router
  .addUsdcPool('usdj2pooltusdusdt', cfg.usdj2pooltusdusdt, [
    cfg.usdjToken,
    cfg.tusdToken,
    cfg.usdtToken,
  ])
  .send();

  await router.addUsdcPool(
    "oldusdcpool",
    cfg.oldusdcpool,
    [
      cfg.usdcToken,
      cfg.usdjToken,
      cfg.tusdToken,
      cfg.usdtToken
    ]).send();
  await router.addPool(
    'old3pool',
    cfg.old3pool,
    [
      cfg.usdjToken,
      cfg.tusdToken,
      cfg.usdtToken
    ]
  ).send();
  


  // address[] memory usdcTokens = new address[](4);
  // usdcTokens[0] = _usdc;
  // usdcTokens[1] = _usdj;
  // usdcTokens[2] = _tusd;
  // usdcTokens[3] = _usdt;
  // addUsdcPool("oldusdcpool", _usdcPool, usdcTokens);
  // address[] memory old3PoolTokens = new address[](3);
  // old3PoolTokens[0] = _usdj;
  // old3PoolTokens[1] = _tusd;
  // old3PoolTokens[2] = _usdt;
  // addPool("old3pool", _old3pool, old3PoolTokens);