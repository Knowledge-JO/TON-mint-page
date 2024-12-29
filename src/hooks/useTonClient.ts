// import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { useAsyncInitialize } from "./useAsyncInitialize";

export function useTonClient() {
  return useAsyncInitialize(
    async () =>
      new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
        apiKey: import.meta.env.VITE_PUBLIC_TONCENTER_API_KEY,
      })
  );
}
