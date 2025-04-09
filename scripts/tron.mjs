import TronWeb from 'tronweb';

let tronWeb = null;

export async function initTronWeb(config) {
  const privateKey = process.env.PRIVATE_KEY;
  if (tronWeb == null) {
    tronWeb = await new TronWeb({
      fullHost: config.rpcURL,
      headers: { 'TRON-PRO-API-KEY': '6afeff82-44da-4fe8-9303-cc568365794b' },
      privateKey: privateKey,
      timeout: 3000000,
    });
  }
  return tronWeb;
}
