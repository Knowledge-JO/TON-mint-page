import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from "@ton/core";

export type mintParams = {
  queryId: number | null;
  itemOwnerAddress: Address;
  itemIndex: number;
  commonContentUrl: string;
};

export class NftCollection implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new NftCollection(address);
  }

  createMintBody(params: mintParams): Cell {
    const body = beginCell();
    body.storeUint(1, 32);
    body.storeUint(params.queryId || 0, 64);
    body.storeUint(params.itemIndex, 64);
    const nftItemContent = beginCell();
    nftItemContent.storeAddress(params.itemOwnerAddress);
    const uriContent = beginCell();
    uriContent.storeBuffer(Buffer.from(params.commonContentUrl));
    nftItemContent.storeRef(uriContent.endCell());
    body.storeRef(nftItemContent.endCell());
    return body.endCell();
  }

  async sendMint(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    params: mintParams
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: this.createMintBody(params),
    });
  }

  async sendChangeAdmin(
    provider: ContractProvider,
    via: Sender,
    newAdmin: Address
  ) {
    await provider.internal(via, {
      value: toNano("0.01"),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(3, 32)
        .storeUint(0, 64)
        .storeAddress(newAdmin)
        .endCell(),
    });
  }

  async sendWithdraw(
    provider: ContractProvider,
    via: Sender,
    amount: bigint,
    toAddr: Address
  ) {
    await provider.internal(via, {
      value: toNano("0.01"),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(5, 32)
        .storeUint(0, 64)
        .storeCoins(amount)
        .storeAddress(toAddr)
        .endCell(),
    });
  }

  async sendWhitelistAddress(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    address: Address
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(7, 32)
        .storeUint(0, 64)
        .storeAddress(address)
        .endCell(),
    });
  }

  async getNftAddressByIndex(provider: ContractProvider, index: number) {
    const res = await provider.get("get_nft_address_by_index", [
      { type: "int", value: BigInt(index) },
    ]);
    return res.stack.readAddress();
  }

  async getTimeStatusData(provider: ContractProvider) {
    const res = await provider.get("get_contract_time_status", []);

    return {
      started: res.stack.readNumber(),
      startTime: res.stack.readNumber(),
      publicStartTime: res.stack.readNumber(),
      endPublicMintTime: res.stack.readNumber(),
      timeNow: res.stack.readNumber(),
    };
  }

  async getCollectionData(provider: ContractProvider) {
    const res = await provider.get("get_collection_data", []);

    return {
      nextItemIndex: res.stack.readNumber(),
    };
  }

  async getWhitelistAddress(provider: ContractProvider, owner: Address) {
    const res = await provider.get("get_whitelist_checker_address", [
      { type: "slice", cell: beginCell().storeAddress(owner).endCell() },
    ]);

    return res.stack.readAddress();
  }
}
