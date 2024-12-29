import { Address, toNano } from "@ton/core";
import { NftCollection } from "../contracts/NftCollection";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { collectionAddress } from "../contracts/constants";
import { useTonAddress } from "@tonconnect/ui-react";
import { WhitelistWallet } from "../contracts/WhitelistWallet";
import { useEffect, useState } from "react";

export function useMint() {
  const client = useTonClient();
  const { sender } = useTonConnect();

  const owner = useTonAddress(true);

  const [timeStatus, setTimeStatus] = useState<{
    started: number;
    startTime: number;
    publicStartTime: number;
    endPublicMintTime: number;
    timeNow: number;
  }>();

  const [nextItemIndex, setNextItemIndex] = useState<number>();

  const openNftCollectionContract = useAsyncInitialize(async () => {
    if (!client) return;

    const contract = client.open(
      NftCollection.createFromAddress(Address.parse(collectionAddress))
    );

    return contract;
  }, [client]);

  const openWhitelistWalletContract = useAsyncInitialize(async () => {
    if (!owner) return;
    const whitelistWalletAddress =
      await openNftCollectionContract?.getWhitelistAddress(
        Address.parse(owner)
      );
    if (whitelistWalletAddress) {
      const contract = client?.open(
        WhitelistWallet.createFromAddress(whitelistWalletAddress)
      );

      return contract;
    }
  }, [owner, openNftCollectionContract]);

  useEffect(() => {
    const getTime = async () => {
      const res = await openNftCollectionContract?.getTimeStatusData();
      if (res) {
        setTimeStatus({
          started: res.started,
          startTime: res.startTime,
          publicStartTime: res.publicStartTime,
          endPublicMintTime: res.endPublicMintTime,
          timeNow: res.timeNow,
        });
      }
    };
    getTime();
  }, [openNftCollectionContract]);

  useEffect(() => {
    getNextItemIndex();
  }, [openNftCollectionContract]);

  async function getNextItemIndex() {
    const res = await openNftCollectionContract?.getCollectionData();
    setNextItemIndex(res?.nextItemIndex);
  }

  return {
    timeStatus,
    nextItemIndex,
    getNextItemIndex,
    async publicMint() {
      if (!owner) return;
      const res = await openNftCollectionContract?.getCollectionData();
      if (res) {
        await openNftCollectionContract?.sendMint(sender, toNano("0.15"), {
          queryId: res.nextItemIndex,
          itemOwnerAddress: Address.parse(owner),
          itemIndex: res.nextItemIndex,
          commonContentUrl: `/`,
        });
      }
    },

    async whitelistMint() {
      if (!owner) return;
      const res = await openNftCollectionContract?.getCollectionData();

      if (res) {
        await openWhitelistWalletContract?.sendMint(sender, toNano("0.065"), {
          queryId: null,
          itemIndex: res.nextItemIndex,
          itemOwnerAddress: Address.parse(owner),
          commonContentUrl: `/`,
        });
      }
    },
  };
}
