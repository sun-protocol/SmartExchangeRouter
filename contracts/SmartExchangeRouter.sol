// SPDX-License-Identifier: MIT
pragma solidity >=0.6.8 <0.9.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IERC20.sol";
import "./interfaces/IPoolPsm.sol";
import "./interfaces/IPoolStable.sol";
import "./interfaces/IRouterV1.sol";
import "./interfaces/IRouterV2.sol";
import "./interfaces/IRouterV3.sol";
import "./interfaces/IWTRX.sol";
import "./helpers/ReentrancyGuard.sol";
import "./helpers/SafeMath.sol";
import "./helpers/TransferHelper.sol";
import "./helpers/V3Encode.sol";

contract SmartExchangeRouter is ReentrancyGuard {
  using SafeMath for uint256;
  struct Context {
    bytes32 version;
    uint256 len;
    uint256 path_i;
    uint256 offset;
    uint256 amountIn;
    uint256 amountOutMin;
    uint256 deadline;
    address[] pathSlice;
    uint256[] amountsOutSlice;
    address recipient;
    uint24[] feesSlice;
  }

  struct TransactionResult {
    bool isSuccess;
    bytes data;
  }

  /**
   * Events & Variables
   */
  event SwapExactETHForTokens(address indexed buyer,
                              uint256 indexed amountIn,
                              uint256[] amountsOut);
  event SwapExactTokensForTokens(address indexed buyer,
                                 uint256 indexed amountIn,
                                 uint256[] amountsOut);
  event TransferOwnership(address indexed originOwner,
                          address indexed newOwner);
  event TransferAdminship(address indexed originOwner,
                          address indexed newOwner);
  event AddPool(address indexed owner,
                address indexed pool,
                address[] tokens);
  event ChangePool(address indexed admin,
                   address indexed pool,
                   address[] tokens);

  
  address public owner; // public for get method
  address public admin;
  address public v1Factory;
  address public v2Router;
  address public v3Router;
  address public psmUsdd;
  address public WTRX;
  mapping(address => mapping(address => bool)) tokenApprovedPool;
  mapping(address => bool) existPools;
  mapping(address => mapping(address => uint128)) poolToken;
  mapping(string => address) stablePools;
  mapping(string => bool) poolVersionUsdc;
  mapping(string => bool) poolVersionPsm;
  mapping(address=> uint256) psmRelativeDecimals;

  uint256 constant maxNum = type(uint256).max;
  // TODO: hard code this to saving gas
  bytes32 constant poolVersionV1 = keccak256(abi.encodePacked("v1"));
  bytes32 constant poolVersionV2 = keccak256(abi.encodePacked("v2"));
  bytes32 constant poolVersionV3 = keccak256(abi.encodePacked("v3"));
  // nile WTRX = 0xfb3b3134F13CcD2C81F4012E53024e8135d58FeE;
  // mainnet WTRX = 
  receive() external payable {}
  fallback() external payable {}

  constructor(
    address _v2Router,
    address _v1Foctroy,
    address _psmUsdd,
    address _v3Router,
    address _wtrx
  ) public {
    owner = msg.sender;
    admin = msg.sender;
    v1Factory = _v1Foctroy;
    v2Router = _v2Router;
    v3Router = _v3Router;
    psmUsdd = _psmUsdd;
    WTRX = _wtrx;
  }

  modifier onlyOwner {
      require(msg.sender == owner, "Permission denied, not an owner");
      _;
  }

  modifier onlyAdmin {
      require(msg.sender == admin, "Permission denied, not an admin");
      _;
  }

  /**
   * external functions
   */
  function transferOwnership(address newOwner) external onlyOwner {
      owner = newOwner;
      emit TransferOwnership(owner, newOwner);
  }

  function transferAdminship(address newAdmin) external onlyAdmin {
      admin = newAdmin;
      emit TransferAdminship(admin, newAdmin);
  }

  function retrieve(address token, address to, uint256 amount)
      external onlyOwner {
    if (token == address(0)) {
      TransferHelper.safeTransferETH(to, amount);
    } else {
      require(TransferHelper.safeTransfer(token, to, amount), "Transfer failed");
    }
  }

  function addPool(string memory poolVersion,
                   address pool,
                   address[] memory tokens) public onlyOwner {
    require(existPools[pool] == false, "pool exist");
    require(tokens.length > 1, "at least 2 tokens");
    for (uint128 i = 0; i < tokens.length; i++){
        poolToken[pool][tokens[i]] = i;
        _approveToken(tokens[i], pool);
    }
    stablePools[poolVersion] = pool;
    existPools[pool] = true;
    emit AddPool(owner, pool, tokens);
  }

  function addUsdcPool(string memory poolVersion,
                       address pool,
                       address[] memory tokens) public onlyOwner {
    addPool(poolVersion, pool, tokens);
    poolVersionUsdc[poolVersion] = true;
  }

  function addPsmPool(string memory poolVersion,
                       address pool,
                       address gemJoin,
                       address[] memory tokens) public onlyOwner {
    require(existPools[pool] == false, "pool exist");
    require(tokens.length == 2 && (tokens[0] == psmUsdd || tokens[1] == psmUsdd),
            "invalid tokens");
    uint256 usddDecimals = 1;
    uint256 gemDecimals = 1;
    for (uint128 i = 0; i < tokens.length; i++){
        poolToken[pool][tokens[i]] = i;
        if (tokens[i] == psmUsdd) {
          _approveToken(tokens[i], pool);
          usddDecimals = erc20(tokens[i]).decimals();
        }
        else {
          _approveToken(tokens[i], gemJoin);
          gemDecimals = erc20(tokens[i]).decimals();
        }
    }
    psmRelativeDecimals[pool] = 10 ** (usddDecimals - gemDecimals);
    stablePools[poolVersion] = pool;
    existPools[pool] = true;
    poolVersionPsm[poolVersion] = true;
    emit AddPool(owner, pool, tokens);
  }

  function isUsdcPool(string memory poolVersion) public view returns(bool) {
    return poolVersionUsdc[poolVersion];
  }

  function isPsmPool(string memory poolVersion) public view returns(bool) {
    return poolVersionPsm[poolVersion];
  }

  function changePool(address pool,
                      address[] calldata tokens) external onlyAdmin {
    require(existPools[pool], "pool not exist");
    require(tokens.length > 1, "at least 2 tokens");
    for (uint128 i = 0; i< tokens.length; i++){
      poolToken[pool][tokens[i]] = i;
      _approveToken(tokens[i], pool);
    }
    emit ChangePool(owner, pool, tokens);
  }

  /**
   * @dev Exchange function for converting Token to Token in a specified path.
   * @param amountIn Amount of Token to be solded.
   * @param amountOutMin Minimal amount of Token expected.
   * @param to Address where token transfer to.
   * @param deadline Time after which this transaction can no longer be executed.
   */
  struct SwapData{
    uint256 amountIn;
    uint256 amountOutMin;
    address to;
    uint256 deadline;
  }

  /**
   * @dev Exchange function for converting TRX to Token in a specified path.
   * @param path A specified exchange path from TRX to token.
   * @param poolVersion List of pool where tokens in path belongs to.
   * @param versionLen List of token num in each pool.
   * @param data encodepacked swap info.
   * @return amountsOut Amount of Tokens bought corresponed to path.
   */
  function swapExactInput(
    address[] calldata path,
    string[] calldata poolVersion,
    uint256[] calldata versionLen,
    uint24[] calldata fees,
    SwapData calldata data
  ) external nonReentrant payable returns(uint256[] memory amountsOut) {
    require(poolVersion.length == versionLen.length && poolVersion.length > 0,
            "INVALID_POOL_VERSION.");
    require(path.length > 0, "INVALID_PATH");
    require(path.length == fees.length, "INVALID_PATH");
    amountsOut = new uint256[](path.length);
    if(path[0] == address(0)){
      require(msg.value >= data.amountIn, "INSUFFIENT_TRX");
      amountsOut[0] = data.amountIn;
    }else{
      amountsOut[0] = _tokenSafeTransferFrom(
        path[0], 
        msg.sender, 
        address(this), 
        data.amountIn
      );
    }

    Context memory context;
    context.path_i = 1;
    context.deadline = data.deadline;
    for (uint256 i = 0; i < poolVersion.length; i++) {
      context.version = keccak256(abi.encodePacked(poolVersion[i]));
      context.len = i == 0 ? versionLen[i] - 1 : versionLen[i];
      require(context.len > 0 && context.path_i + context.len <= path.length,
              "INVALID_VERSION_LEN");
      context.amountIn = amountsOut[context.path_i - 1];
      // context.offset = 1;
      context.amountOutMin = i + 1 == poolVersion.length ? data.amountOutMin : 1;
      context.recipient = i + 1 == poolVersion.length ? data.to : address(this);
      if (context.version == poolVersionV2) {
        // v2 router
        context.pathSlice = _constructPathSlice(path,
                                                context.path_i - 1,
                                                context.len + 1);
        context.amountsOutSlice = _swapExactTokensForTokensV2(context);
        for (uint256 j = 0; j < context.len; j++) {
          amountsOut[context.path_i] = context.amountsOutSlice[j + 1];
          context.path_i++;
        }
      } else if (context.version == poolVersionV1) {
        // v1 factory
        context.pathSlice = _constructPathSlice(path,
                                                context.path_i - 1,
                                                context.len + 1);
        context.amountsOutSlice = _swapExactTokensForTokensV1(context);
        for (uint256 j = 0; j < context.len; j++) {
          amountsOut[context.path_i] = context.amountsOutSlice[j + 1];
          context.path_i++;
        }
      } else if(context.version == poolVersionV3){
        context.pathSlice = _constructPathSlice(path,
                                                context.path_i - 1,
                                                context.len + 1);
        context.feesSlice = _constructFeesSlice(fees,
                                                context.path_i - 1,  
                                                context.len + 1);
        context.amountsOutSlice = _swapExactInputV3(context);

        for (uint256 j = 0; j < context.len; j++) {
          amountsOut[context.path_i] = context.amountsOutSlice[j + 1];
          context.path_i++;
        }
      } else {
        // stable pool
        context.pathSlice = _constructPathSlice(path,
                                                context.path_i - 1,
                                                context.len + 1);
        context.amountsOutSlice = _stablePoolExchange(poolVersion[i],
                                                      context.pathSlice,
                                                      context.amountIn,
                                                      context.amountOutMin);
        for (uint256 j = 0; j < context.len; j++) {
          amountsOut[context.path_i] = context.amountsOutSlice[j + 1];
          context.path_i++;
        }
        if (context.path_i == path.length) {
          amountsOut[context.path_i - 1] = _tokenSafeTransfer(
            path[context.path_i - 1],
            context.recipient,
            amountsOut[context.path_i - 1]);
          // double check
          require(amountsOut[context.path_i - 1] >= context.amountOutMin,
                  "amountOutMin not satisfied.");
        }
      }
    }
    require(amountsOut[path.length - 1] >= data.amountOutMin,
                  "Global amountOutMin not satisfied.");
    assert(context.path_i == path.length);
    emit SwapExactTokensForTokens(msg.sender, data.amountIn, amountsOut);
  }

  /**
   * internal functions
   */
  function _approveToken(address token, address pool) internal {
    if (tokenApprovedPool[token][pool] == false) {
      require(TransferHelper.safeApprove(token, pool, maxNum), "Approve failed");
      tokenApprovedPool[token][pool] = true;
    }
  }

  function _constructPathSlice(address[] memory path, uint256 pos, uint256 len)
      internal pure returns(address[] memory pathOut) {
    require(len > 1 && pos + len <= path.length, "INVALID_ARGS");
    pathOut = new address[](len);
    for (uint256 j = 0; j < len; j++) {
      pathOut[j] = path[pos + j];
    }
  }
  function _constructFeesSlice(uint24[] memory fees, uint256 pos, uint256 len)
      internal pure returns(uint24[] memory feesOut) {
    require(len > 1 && pos + len <= fees.length, "INVALID_FEES");
    feesOut = new uint24[](len);
    for (uint256 j = 0; j < len; j++) {
      feesOut[j] = fees[pos + j];
    }
  }
  function _tokenSafeTransferFrom(address token,
                                  address from,
                                  address to,
                                  uint256 value) internal returns(uint256) {
    require(from != to, "INVALID_ARGS");
    uint256 balanceBefore = erc20(token).balanceOf(to);
    require(TransferHelper.safeTransferFrom(token, from, to, value),
            "Transfer failed");
    uint256 balanceAfter = erc20(token).balanceOf(to);
    return balanceAfter - balanceBefore;
  }

  function _tokenSafeTransfer(address token, address to, uint256 value)
      internal virtual returns(uint256) {
    require(to != address(this) && to != address(0), "INVALID_ARGS");
    uint256 balanceBefore = erc20(token).balanceOf(to);
    require(TransferHelper.safeTransfer(token, to, value), "Transfer failed");
    uint256 balanceAfter = erc20(token).balanceOf(to);
    return balanceAfter - balanceBefore;
  }

  /**
   * stablePool functions
   */
  function _stablePoolExchange(string memory poolVersion,
                               address[] memory path,
                               uint256 amountIn,
                               uint256 amountOutMin)
      internal returns(uint256[] memory amountsOut) {
    address pool = stablePools[poolVersion];
    require(pool != address(0), "pool not exist");
    require(path.length > 1, "INVALID_PATH_SLICE");

    amountsOut = new uint256[](path.length);
    amountsOut[0] = amountIn;
    for (uint256 i = 1; i < path.length; i++) {
      uint128 tokenIdIn = poolToken[pool][path[i - 1]];
      uint128 tokenIdOut = poolToken[pool][path[i]];
      require(tokenIdIn != tokenIdOut, "INVALID_PATH_SLICE");
      uint256 amountMin = i + 1 == path.length ? amountOutMin : 1;
      uint256 balanceBefore = erc20(path[i]).balanceOf(address(this));
      if (isUsdcPool(poolVersion)) {
          usdcPoolF(pool).exchange_underlying(int128(tokenIdIn),
                                              int128(tokenIdOut),
                                              amountsOut[i - 1],
                                              amountMin);
      } else if (isPsmPool(poolVersion)) {
        if (path[i - 1] == psmUsdd) {
          // TODO: how to deal with leak usdd ?
          psm(pool).buyGem(address(this),
                           amountsOut[i - 1] / psmRelativeDecimals[pool]);
        } else if (path[i] == psmUsdd) {
          psm(pool).sellGem(address(this), amountsOut[i - 1]);
        } else {
          revert('INVALID_PSM_TOKEN');
        }
      } else {
          poolStable(pool).exchange(tokenIdIn,
                                    tokenIdOut,
                                    amountsOut[i - 1],
                                    amountMin);
      }
      uint256 balanceAfter = erc20(path[i]).balanceOf(address(this));
      amountsOut[i] = balanceAfter - balanceBefore;
      require(amountsOut[i] >= amountMin, "amountMin not satisfied");
    }
  }

  /**
   * v1 functions
   */
  function _trxToTokenTransferInput(address token,
                                    uint256 amountIn,
                                    uint256 amountOutMin,
                                    address recipient,
                                    uint256 deadline)
      internal returns(uint256 amountOut) {
      address payable exchange =v1(v1Factory).getExchange(token);
      require(exchange != address(0), "exchanger not found");

      TransactionResult memory result;
      (result.isSuccess, result.data) =
        TransferHelper.executeTransaction(
          exchange,
          amountIn,
          "trxToTokenTransferInput(uint256,uint256,address)",
          abi.encode(amountOutMin, deadline, recipient));
      require(result.isSuccess, "Transaction failed.");
      amountOut = abi.decode(result.data, (uint256));
  }

  function _tokenToTrxTransferInput(address token,
                                    uint256 amountIn,
                                    uint256 amountOutMin,
                                    address recipient,
                                    uint256 deadline)
      internal returns(uint256 amountOut) {
      address payable exchange =v1(v1Factory).getExchange(token);
      require(exchange != address(0), "exchanger not found");
      _approveToken(token, exchange);

      TransactionResult memory result;
      (result.isSuccess, result.data) =
        TransferHelper.executeTransaction(
          exchange,
          0,
          "tokenToTrxTransferInput(uint256,uint256,uint256,address)",
          abi.encode(amountIn, amountOutMin, deadline, recipient));
      require(result.isSuccess, "Transaction failed.");
      amountOut = abi.decode(result.data, (uint256));
  }

  function _tokenToTokenTransferInput(address tokenIn,
                                      address tokenOut,
                                      Context memory context)
      internal returns(uint256 amountOut) {
    address payable exchange = v1(v1Factory).getExchange(tokenIn);
    require(exchange != address(0), "exchanger not found");
    _approveToken(tokenIn, exchange);
    TransactionResult memory result;
    (result.isSuccess, result.data) =
      TransferHelper.executeTransaction(
        exchange,
        0,
        "tokenToTokenTransferInput(uint256,uint256,uint256,uint256,address,address)",
        abi.encode(context.amountIn,
                   context.amountOutMin,
                   1,
                   context.deadline,
                   context.recipient,
                   tokenOut));
    require(result.isSuccess, "Transaction failed.");
    amountOut = abi.decode(result.data, (uint256));
  }

  function _swapExactTokensForTokensV1(Context memory context)
      internal returns(uint256[] memory amountsOut) {
    require(context.pathSlice.length > 1, "INVALID_PATH_SLICE");
    amountsOut = new uint256[](context.pathSlice.length);
    amountsOut[0] = context.amountIn;
    for (uint256 i = 1; i < context.pathSlice.length; i++) {
      require(context.pathSlice[i - 1] != context.pathSlice[i],
              "INVALID_PATH_SLICE");
      Context memory ctx;
      ctx.amountIn = amountsOut[i - 1];
      ctx.amountOutMin =
        i + 1 == context.pathSlice.length ? context.amountOutMin
                                          : 1;
      ctx.recipient = i + 1 == context.pathSlice.length ? context.recipient
                                                        : address(this);
      ctx.deadline = context.deadline;
      if (context.pathSlice[i - 1] == address(0)) {
        amountsOut[i] = _trxToTokenTransferInput(context.pathSlice[i],
                                                 ctx.amountIn,
                                                 ctx.amountOutMin,
                                                 ctx.recipient,
                                                 ctx.deadline);
      } else if (context.pathSlice[i] == address(0)) {
        amountsOut[i] = _tokenToTrxTransferInput(context.pathSlice[i - 1],
                                                 ctx.amountIn,
                                                 ctx.amountOutMin,
                                                 ctx.recipient,
                                                 ctx.deadline);
      } else {
        amountsOut[i] = _tokenToTokenTransferInput(context.pathSlice[i - 1],
                                                   context.pathSlice[i],
                                                   ctx);
      }
    }
  }

  /**
   * v2 functions
   */
  function _swapExactTokensForTokensV2(Context memory context)
      internal returns (uint256[] memory amounts) {
    require(context.pathSlice.length > 1, "INVALID_PATH_SLICE");
    address tokenIn = context.pathSlice[0];
    address tokenOut = context.pathSlice[context.pathSlice.length - 1];
    amounts = new uint256[](context.pathSlice.length);
    uint256 midPath_start = 0;
    address[] memory midPath;
    if (tokenIn == address(0)){
      amounts[0] = context.amountIn;
      amounts[1] = context.amountIn;        
      IWTRX(WTRX).deposit{value: context.amountIn}();
      if(context.pathSlice.length == 2){
        TransferHelper.safeTransfer(WTRX, context.recipient, context.amountIn);
        return amounts;
      }
      midPath = _constructPathSlice(context.pathSlice, 1, context.pathSlice.length - 1);
      midPath_start = 1;      
    }else{
      midPath = context.pathSlice;
    }
    uint256[] memory outAmounts;
    //_approveToken(midPath[0], v2Router);
    if(tokenOut == address(0)){
      if(context.pathSlice.length == 2){
        amounts[0] = context.amountIn;
        amounts[1] = context.amountIn;
        unwrapWTRX(context.amountIn, context.recipient);
        return amounts;
      }
      _approveToken(midPath[0], v2Router);
      outAmounts = v2(v2Router).swapExactTokensForTokens(
        context.amountIn,
        context.amountOutMin,
        _constructPathSlice(midPath, 0, midPath.length - 1),
        address(this),
        context.deadline
      );
      for(uint256 i = 0; i < outAmounts.length; i++){
        amounts[midPath_start + i] = outAmounts[i];
      }
      amounts[amounts.length - 1] = amounts[amounts.length - 2];
      unwrapWTRX(amounts[amounts.length - 1], context.recipient);
    }else{
      _approveToken(midPath[0], v2Router);
      outAmounts = v2(v2Router).swapExactTokensForTokens(
        context.amountIn,
        context.amountOutMin,
        _constructPathSlice(midPath, 0, midPath.length),
        context.recipient,
        context.deadline
      );
      for(uint256 i = 0; i < outAmounts.length; i++){
        amounts[midPath_start + i] = outAmounts[i];
      }
    }

  }
  /**
   * v3 functions
   */
  function _swapExactInputV3(Context memory context) internal returns(uint256[] memory amounts){
    amounts = new uint256[](context.pathSlice.length);
    require(context.pathSlice.length > 1, "INVALID_PATH_SLICE");
    // create the inputParams
    v3.ExactInputParams memory inputParams;
    inputParams.path = V3Encode.encodePath(context.pathSlice,context.feesSlice);
    inputParams.recipient = context.recipient;
    inputParams.deadline = context.deadline;
    inputParams.amountIn = context.amountIn;
    inputParams.amountOutMinimum = context.amountOutMin;
    _approveToken(context.pathSlice[0], v3Router);
    uint256  amountOut = v3(v3Router).exactInput(inputParams);
    // merge amounts out
    amounts[amounts.length - 1] = amountOut;
  }

  function unwrapWTRX(uint256 amountMinimum, address recipient) public payable{
    uint256 balanceWTRX = erc20(WTRX).balanceOf(address(this));
    require(balanceWTRX >= amountMinimum, "Insufficient WTRX");
    if (balanceWTRX > 0) {
      IWTRX(WTRX).withdraw(balanceWTRX);
      if(recipient != address(this)){
        TransferHelper.safeTransferETH(recipient, amountMinimum);
      }
    }
  }
}
