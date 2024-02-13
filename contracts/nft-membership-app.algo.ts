import { Contract } from '@algorandfoundation/tealscript';

const BOX_COST = 2500 + 400 * (1 + 32);

// eslint-disable-next-line no-unused-vars
class NftMembershipApp extends Contract {
  membershipPrice = GlobalStateKey<uint64>();

  membershipNft = GlobalStateKey<Asset>();

  memberInfo = BoxMap<Address, boolean>();

  authorizeCreator(): void {
    assert(this.app.creator === this.txn.sender);
  }

  createApplication(membershipPrice: uint64): void {
    this.membershipPrice.value = membershipPrice;
  }

  /**
   * A method that creates the Membership NFT
   *
   * TODO: should the asset total be a power of 10? and should the decimals be 0?
   *
   * @param name
   * @param total
   * @param unitName
   * @param assetUrl
   */
  createMembershipNft(name: string, total: uint64, unitName: string, assetUrl: string): Asset {
    this.authorizeCreator();
    // Create a new NFT
    const createdAsset = sendAssetCreation({
      configAssetName: name,
      configAssetTotal: total,
      configAssetDecimals: 0,
      configAssetUnitName: unitName,
      configAssetURL: assetUrl,
      configAssetClawback: this.app.address,
      configAssetDefaultFrozen: 1,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address,
      configAssetFreeze: this.app.address,
      fee: 0,
    });

    this.membershipNft.value = createdAsset;

    return createdAsset;
  }

  /**
   * A method that allows a user to purchase a membership
   *
   * @param payment
   */
  getMembership(payment: PayTxn, nftOptIn: AssetTransferTxn): void {
    assert(this.membershipNft.exists);
    assert(payment.amount === this.membershipPrice.value + BOX_COST);
    assert(payment.receiver === this.app.address);
    assert(payment.sender === this.txn.sender);
    // assert(nftOptIn.assetAmount === 0);
    // assert(nftOptIn.assetReceiver === nftOptIn.assetSender);
    // assert(nftOptIn.xferAsset.id === this.membershipNft.value.id);

    sendAssetTransfer({
      xferAsset: this.membershipNft.value,
      assetAmount: 1,
      assetSender: this.app.address,
      assetReceiver: this.txn.sender,
      fee: 0,
    });

    this.memberInfo(this.txn.sender).value = true;
  }

  /**
   * A method that allows a user to cancel their membership
   */
  cancelMembership(): void {
    assert(this.memberInfo(this.txn.sender).value === true);
    assert(this.membershipNft.exists);

    // Clawback asset transfer to retrieve the membership NFT
    sendAssetTransfer({
      sender: this.app.address,
      xferAsset: this.membershipNft.value,
      assetAmount: 1,
      assetSender: this.txn.sender,
      assetReceiver: this.app.address,
      fee: 0,
    });

    this.memberInfo(this.txn.sender).delete();

    const refundAmount = this.membershipPrice.value + BOX_COST;

    sendPayment({
      amount: refundAmount,
      receiver: this.txn.sender,
      fee: 0,
    });
  }
}
