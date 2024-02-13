import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';
import { NftMembershipAppClient } from '../contracts/clients/NftMembershipAppClient';

const fixture = algorandFixture();

let appClient: NftMembershipAppClient;
let appAddr: string;
let appId: number | bigint;
let algod: algosdk.Algodv2;
let testAccount: algosdk.Account;
const BOX_COST = 2500 + 400 * (1 + 32);

describe('NftMembershipApp', () => {
  beforeEach(fixture.beforeEach);
  // beforeEach(() => {
  //   sharedState
  // })

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

    const globalState = await appClient.getGlobalState();
    expect(globalState.membershipPrice?.asNumber()).toBe(1000000);
  });

  // create nft
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

    const globalState = await appClient.getGlobalState();
    expect(globalState.membershipNft).toBeDefined();
    expect(createdAsset.return?.valueOf()).toBeDefined();
  });

  // get membership
  test('Get membership', async () => {
    const sp = await algod.getTransactionParams().do();
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: testAccount.addr,
      to: appAddr,
      suggestedParams: sp,
      amount: 1000000 + BOX_COST,
    });

    const globalState = await appClient.getGlobalState();
    const membershipNftId = globalState.membershipNft?.asNumber();
    console.log('membership nft id ', membershipNftId);

    const optIntoNft = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: testAccount.addr,
      to: testAccount.addr,
      suggestedParams: sp,
      assetIndex: Number(membershipNftId),
      amount: 0,
    });

    await appClient.getMembership(
      { payment: paymentTxn, nftOptIn: optIntoNft },
      { sendParams: { fee: algokit.transactionFees(2) } }
    );
    const memberInfo = await appClient.appClient.getBoxValue(testAccount.addr);
    const accountInfo = await algod.accountInformation(testAccount.addr).do();
    console.log(accountInfo);
    expect(memberInfo).toBe(true);
  });

  // cancel membership
});
