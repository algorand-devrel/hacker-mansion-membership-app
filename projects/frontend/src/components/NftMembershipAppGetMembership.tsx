/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { NftMembershipAppClient } from '../contracts/NftMembershipAppClient'
import { useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import { microAlgos } from '@algorandfoundation/algokit-utils'

/* Example usage
<NftMembershipAppGetMembership
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call getMembership"
  typedClient={typedClient}
  payment={payment}
  nftOptIn={nftOptIn}
/>
*/

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: NftMembershipAppClient
  membershipPrice: number
  membershipNft: number
  algodClient: algosdk.Algodv2
  setIsMember: (isMember: boolean) => void
}

const NftMembershipAppGetMembership = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)

    const { appAddress } = await props.typedClient.appClient.getAppReference()

    const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: appAddress,
      amount: props.membershipPrice,
      suggestedParams: await props.algodClient.getTransactionParams().do(),
    })

    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: sender.addr,
      assetIndex: props.membershipNft,
      amount: 0,
      suggestedParams: await props.algodClient.getTransactionParams().do(),
    })

    console.log(`Calling getMembership`)
    await props.typedClient.getMembership(
      {
        payment: { transaction: payTxn, signer: sender },
        nftOptIn: { transaction: optInTxn, signer: sender },
      },
      { sender, sendParams: { fee: microAlgos(2_000) } },
    )
    setLoading(false)
    props.setIsMember(true)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default NftMembershipAppGetMembership
