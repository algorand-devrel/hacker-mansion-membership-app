/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { NftMembershipAppClient } from '../contracts/NftMembershipAppClient'
import { useWallet } from '@txnlab/use-wallet'
import { microAlgos } from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'

/* Example usage
<NftMembershipAppCreateApplication
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call createApplication"
  typedClient={typedClient}
  membershipPrice={membershipPrice}
/>
*/

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: NftMembershipAppClient
  algodClient: algosdk.Algodv2
  setAppID: (appID: number) => void
}

const NftMembershipAppCreateApplication = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [membershipPrice, setMembershipPrice] = useState<number>(0)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling createApplication`)
    await props.typedClient.create.createApplication(
      {
        membershipPrice,
      },
      { sender },
    )

    const { appId, appAddress } = await props.typedClient.appClient.getAppReference()

    console.log(`Calling createMembershipNft`)

    const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: appAddress,
      amount: 200_000,
      suggestedParams: await props.algodClient.getTransactionParams().do(),
    })

    const result = await props.typedClient
      .compose()
      .addTransaction({ txn: fundTxn, signer })
      .createMembershipNft(
        {
          name: 'Membership NFT',
          unitName: 'MEM',
          total: 100,
          assetUrl: 'ipfs://QmafQYTHTXwR6uMf39tgTtg4Xa2x2TYtWAJdJNAYqkNraV#arc3',
        },
        { sender, sendParams: { fee: microAlgos(2_000) } },
      )
      .execute()

    console.log(`Created Membership NFT: ${result.returns[0].valueOf()}`)
    setLoading(false)

    props.setAppID(Number(appId))
  }

  return (
    <div>
      <input
        className="input input-bordered"
        type="number"
        defaultValue={1}
        onChange={(e) => setMembershipPrice(e.currentTarget.valueAsNumber * 1e6)}
      ></input>
      <button className={props.buttonClass} onClick={callMethod}>
        {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
      </button>
    </div>
  )
}

export default NftMembershipAppCreateApplication
