# smart-router

swap smart-router

# Build

## Install tronbox

```
git clone git@39.106.174.213:defi-infra/tronbox.git
npm install
npm run build
```

## Build router

- change tronbox.js options

```
version: '0.6.8'
```

- Compile

```
tronbox compile
```

# Deploy

## Set Private Key

```
export PRIVATE_KEY_NILE='Your private key'
```

## Deploy

```
tronbox migrate --network nile --f 1 --to 2
```

# How to Use

User can call the API to obtain the trade path and expected data, then invoke the `swapExactInput` method of the smart contract to trigger the transaction. The smart router will handle the transaction data internally and complete the trade.

## Get to the Trade Info from API

API:

**Name: https://rot.endjgfsv.link/swap/route**

**Type: GET**


**Parameters:**
|Name|Description|
|---|---|
|fromToken|Address of fromToken|
|toToken|Address of toToken|
|amountIn|Amount of the token to be swapped|
|typeList|Types available for the swap (PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3)|

**Returns:**
|Name|Description|
|---|---|
|amountIn|Amount of the token entered (divided by precision)|
|amountOut|Amount of the token that can be swapped for, calculated by the Smart Router (divided by precision)|
|InUsd|USD price of the entered token|
|OutUsd|USD price of the token to be swapped for|
|impact|Price impact|
|fee|Transaction fee|
|tokens|Addresses of the tokens that the path from fromToken to toToken involves|
|symbols|Symbols of the tokens that the path from fromToken to toToken involves|
|poolFees|Transaction fees of the liquidity pools that the path from fromToken to toToken involves (0 is displayed for non-SunSwap V3 pools)|
|poolVersions|Versions of the liquidity pools that the path from fromToken to toToken involves|
|stepAmountsOut|Amounts of the tokens obtained from each pool along the path from fromToken to toToken|



**Demo**

Request:
swap USDT to USDD with 100000 USDT in all types
```
curl https://rot.endjgfsv.link/swap/router?fromToken=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&toToken=TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz&amountIn=100000000000&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3
```
Result:
API returns 3 paths of trade ordered by amountOut
```
{
  "code": 0,
  "message": "SUCCESS",
  "data": [
    {
      "amountIn": "100000.000000",
      "amountOut": "100000.000000000000000000",
      "inUsd": "99928.422500000000000000000000",
      "outUsd": "100000.000000000000000000000000000000000000",
      "impact": "0.000000",
      "fee": "0.000000",
      "tokens": [
        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz"
      ],
      "symbols": [
        "USDT",
        "USDD"
      ],
      "poolFees": [
        "0",
        "0"
      ],
      "poolVersions": [
        "usdt20psm"
      ],
      "stepAmountsOut": [
        "100000.000000000000000000"
      ]
    },
    {
      "amountIn": "100000.000000",
      "amountOut": "99977.728820798625493153",
      "inUsd": "99928.422500000000000000000000",
      "outUsd": "99977.728820798625493153000000000000000000",
      "impact": "-0.000050",
      "fee": "10.000000",
      "tokens": [
        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz"
      ],
      "symbols": [
        "USDT",
        "USDD"
      ],
      "poolFees": [
        "100",
        "0"
      ],
      "poolVersions": [
        "v3"
      ],
      "stepAmountsOut": [
        "99977.728820798625493153"
      ]
    },
    {
      "amountIn": "100000.000000",
      "amountOut": "99906.907800507518972425",
      "inUsd": "99928.422500000000000000000000",
      "outUsd": "99906.907800507518972425000000000000000000",
      "impact": "-0.000084",
      "fee": "40.000000",
      "tokens": [
        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz"
      ],
      "symbols": [
        "USDT",
        "USDD"
      ],
      "poolFees": [
        "0",
        "0"
      ],
      "poolVersions": [
        "usdd202pool"
      ],
      "stepAmountsOut": [
        "99906.907800507518972425"
      ]
    }
  ]
}
```

## Build the transaction

#### **1.swapExactInput Function**

**Description**

The  `swapExactInput` function is the unified entrance for swaps.

**Function Signature:**

```
function swapExactInput(
        address[] calldata path,
        string[] calldata poolVersion,
        uint256[] calldata versionLen,
        uint24[] calldata fees,
        SwapData calldata data
    ) external nonReentrant payable returns (uint256[] memory amountsOut)

struct SwapData {
        uint256 amountIn;
        uint256 amountOutMin;
        address to;
        uint256 deadline;
    }
```

**Parameters:**

* `path`: The token address list for swap to.  
* `poolVersion`: The version list for pool‘s version for pathed token.  
* `versionLen`: The length list for pool’s length by version.  
* `fees`: The fees list for pool’s fees, just support the SUNSWAP V3 pools  
* `data`: The swap info ,Use `SwapData` Structure ,obtain token `amountIn`, min amountOut expect `amountOutMin` ,receiver `to`  and `deadline`

**Fullfill the Parameters**

As a sample for API result path 1
```
{
      "amountIn": "100000.000000",
      "amountOut": "100000.000000000000000000",
      "inUsd": "99928.422500000000000000000000",
      "outUsd": "100000.000000000000000000000000000000000000",
      "impact": "0.000000",
      "fee": "0.000000",
      "tokens": [
        "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz"
      ],
      "symbols": [
        "USDT",
        "USDD"
      ],
      "poolFees": [
        "0",
        "0"
      ],
      "poolVersions": [
        "usdt20psm"
      ],
      "stepAmountsOut": [
        "100000.000000000000000000"
      ]
    }
```
|Name|Value|Description|
|---|---|---|
|path|[USDT address,USDD address]| `tokens` in API result|
|poolVersion|['usdt20psm']|`poolVersions` in API result|
|versionLen|['2']|array of counts of token numbers in `poolVersions`, eg: if path = [A,B,C,D],poolVersion = ['v2','v2','v3'],that means A->B use 'V2', B->C use 'V2',C->D use 'V3',so the  versionLen = ['3','1']. The number of first poolversion count must +1 |
|fees|[0,0]|`poolFees` in API result |
|data|['100000000000',amountOut *(1 - flapPiont),receiver,deadline]|SwapData|


## Trigger the transaction


**Example Call:**

```javascript
const tronWeb = require('tronweb');
const contractAddress ='TCFNp179Lg46D16zKoumd4Poa2WFFdtqYj
';

const amountOutMin = '99000000000000000000000'; // Example minimum amount of tokens to receive ,1% flap point
const pathUSDT2USDD =       ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz"]; // Example path
const poolVersion = ["usdt20psm"];
const versionLen = ["2"];
const fees = [0,0];
const amountIn = '100000000000'
const to = 'TYourAddressHere';
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
const swapdata = [amountIn,amountOutMin,to,deadline];

const swapExactInput = async () => {
    const contract = await tronWeb.contract(abi, contractAddress);
    await contract.swapExactInput(
        path, 
        poolVersion, 
        versionLen, 
        fees,
        swapdata
    ).send();
};

```
