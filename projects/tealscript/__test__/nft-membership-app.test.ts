/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { NftMembershipAppClient } from '../contracts/clients/NftMembershipAppClient';

const fixture = algorandFixture();

let appClient: NftMembershipAppClient;
let appAddr: string;
let algod: algosdk.Algodv2;
let appId: number | bigint;
let testAccount: algosdk.Account;
let membershipNft: bigint | undefined;

describe('NftMembershipApp', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    algod = fixture.context.algod;
    testAccount = fixture.context.testAccount;

    appClient = new NftMembershipAppClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );

    // Membership Price is 1 Algo or 1_000_000 microAlgos
    const appInfo = await appClient.create.createApplication({ membershipPrice: 1000000 });

    appAddr = appInfo.appAddress;
    appId = appInfo.appId;

    algokit.transferAlgos(
      {
        amount: algokit.algos(0.1),
        from: testAccount,
        to: appAddr,
      },
      algod
    );
  });

  test('Create a membership NFT', async () => {
    const name = 'Membership NFT';
    const total = 1000;
    const unitName = 'MEM';
    const assetUrl = 'https://example.com/membership-nft';

    // Conver minimum balance for asset creation
    algokit.transferAlgos(
      {
        amount: algokit.algos(0.1),
        from: testAccount,
        to: appAddr,
      },
      algod
    );

    const createdAsset = await appClient.createMembershipNft(
      {
        name,
        total,
        unitName,
        assetUrl,
      },
      { sendParams: { fee: algokit.transactionFees(2) } }
    );

    membershipNft = createdAsset.return?.valueOf();
    const globalState = await appClient.getGlobalState();

    // Check if membershipNft global state was defined
    expect(globalState.membershipNft?.asNumber()).toBeGreaterThan(0);

    // Check if membership NFT was properly created
    expect(createdAsset.return?.valueOf()).toBeDefined();
  });

  // get membership
  test('Get membership', async () => {
    const sp = await algod.getTransactionParams().do();
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: testAccount.addr,
      to: appAddr,
      suggestedParams: sp,
      amount: 1000000,
    });

    const optIntoNft = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: testAccount.addr,
      to: testAccount.addr,
      suggestedParams: sp,
      assetIndex: Number(membershipNft),
      amount: 0,
    });

    await appClient.getMembership(
      { payment: paymentTxn, nftOptIn: optIntoNft },
      { sendParams: { fee: algokit.transactionFees(2), populateAppCallResources: true } }
    );

    const memberInfo = await appClient.appClient.getBoxValueFromABIType(
      algosdk.decodeAddress(testAccount.addr).publicKey,
      new algosdk.ABIBoolType()
    );
    const accountInfo = await algod.accountInformation(testAccount.addr).do();
    const assetList = accountInfo.assets;
    const indexedAssetList = assetList.reduce((acc: any, obj: any) => {
      acc[obj['asset-id']] = obj;
      return acc;
    }, {});

    // Check if the test account received the membership Nft
    expect(indexedAssetList[Number(membershipNft)].amount).toBe(1);

    // Check if the account's member box storage is created and the deposited value is set to true.
    expect(memberInfo.valueOf()).toBe(true);
  });

  // cancel membership
  test('Cancel Membership', async () => {
    await appClient.cancelMembership(
      {},
      {
        sendParams: {
          fee: algokit.transactionFees(3),
          populateAppCallResources: true,
        },
      }
    );

    const accountInfo = await algod.accountInformation(testAccount.addr).do();
    const assetList = accountInfo.assets;
    const indexedAssetList = assetList.reduce((acc: any, obj: any) => {
      acc[obj['asset-id']] = obj;
      return acc;
    }, {});

    const memberBoxList = await appClient.appClient.getBoxNames();

    // Check if test account no longer has the membership NFT
    expect(indexedAssetList[Number(membershipNft)].amount).toBe(0);

    // Check if the member box storage is deleted on the smart contract
    expect(memberBoxList.length).toBe(0);
  });
});
