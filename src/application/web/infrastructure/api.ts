import getApiClient from '@/infrastructure/api';

// クライアント専用コードであることを明示する
let FOR_CLIENT_API_URL = '';

// useEffectとかの中で実行するか、このファイルが読み込まれるタイミングを制御する
if (typeof document !== 'undefined') {
  // documentを使う判定の方が安全なことが多いよ
  FOR_CLIENT_API_URL = `${window.location.protocol}//${window.location.host}`;
}

const getApiClientForClient = () => getApiClient(FOR_CLIENT_API_URL);
export default getApiClientForClient;
