# smart-router

swap smart-router

# Build

## 安装 tronbox

```
git clone git@39.106.174.213:defi-infra/tronbox.git
npm install
npm run build
```

## build router

- 修改 tronbox.js 配置

```
version: '0.6.8'
```

- 执行 Build

```
tronbox compile
```

# Deploy

## 配置私钥

```
export PRIVATE_KEY_NILE='Your private key'
```

## 执行部署

```
tronbox migrate --network nile --f 1 --to 2
```
