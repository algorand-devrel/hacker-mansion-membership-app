import { Contract } from '@algorandfoundation/tealscript';

export class NftMembershipApp extends Contract {
  /** The price of membership */
  membershipPrice = GlobalStateKey<uint64>();

  /** The asset ID of the membership NFT */
  membershipNft = GlobalStateKey<Asset>();

  /** Whether the given address is a member or not */
  memberInfo = BoxMap<Address, boolean>();

  /** Ensure the caller is the app creator */
  private authorizeCreator(): void {
    assert(this.app.creator === this.txn.sender);
  }

  /**
   * Create the application
   *
   * @param membershipPrice The price of membership (in uALGO)
   */
  createApplication(membershipPrice: uint64): void {
    this.membershipPrice.value = membershipPrice;
  }

  /**
   * A method that creates the Membership NFT
   *
   * @param name The name of the token
   * @param total The total amount of the token we should mint
   * @param unitName The short name for the token (e.g. "USDC")
   * @param assetUrl The URL pointing to the NFT metadata
   */
  createMembershipNft(name: string, total: uint64, unitName: string, assetUrl: string): Asset {
    this.authorizeCreator();

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
    });

    this.membershipNft.value = createdAsset;

    return createdAsset;
  }

  /**
   * A method that allows a user to purchase a membership
   *
   * @param payment The users payment to the application
   * @param nftOptIn The users opt-in transaction to the membership NFT
   */
  getMembership(payment: PayTxn, nftOptIn: AssetTransferTxn): void {
    assert(this.membershipNft.exists);
    assert(!this.memberInfo(this.txn.sender).exists || this.memberInfo(this.txn.sender).value === false);

    verifyPayTxn(payment, {
      amount: this.membershipPrice.value,
      receiver: this.app.address,
      sender: this.txn.sender,
    });

    verifyAssetTransferTxn(nftOptIn, {
      sender: this.txn.sender,
      xferAsset: this.membershipNft.value,
      assetAmount: 0,
      assetReceiver: this.txn.sender,
    });

    sendAssetTransfer({
      xferAsset: this.membershipNft.value,
      assetAmount: 1,
      assetSender: this.app.address,
      assetReceiver: this.txn.sender,
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
    });

    this.memberInfo(this.txn.sender).delete();

    const refundAmount = this.membershipPrice.value;

    sendPayment({
      amount: refundAmount,
      receiver: this.txn.sender,
    });
  }
}
