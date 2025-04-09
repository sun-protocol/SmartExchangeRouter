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

User can invoke the `swapExactInput` method of the smart contract to trigger the transaction. The smart router will handle the transaction data internally and complete the trade.

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

If user use 100000 USDT to swap USDD token, the parameteres should be:

|Name|Value|Description|
|---|---|---|
|path|[USDT address,USDD address]| path of tokens|
|poolVersion|['usdt20psm']|poolVersion can be `v1`,`V2`,`V3`,`usdt20psm`,`usdd202pool`...|
|versionLen|['2']|array of counts of token numbers in `poolVersions`, eg: if path = [A,B,C,D],poolVersion = ['v2','v2','v3'],that means A->B use 'V2', B->C use 'V2',C->D use 'V3',so the  versionLen = ['3','1']. The number of first poolversion count must +1 |
|fees|[0,0]|`poolFees` used to distinguish V3 pools; all other pools are set to 0. |
|data|['100000000000',amountOut *(1 - flapPiont),receiver,deadline]|SwapData|


## Trigger the transaction


**Example Call:**

```javascript
const tronWeb = require('tronweb');
const contractAddress = 'TCFNp179Lg46D16zKoumd4Poa2WFFdtqYj';

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
