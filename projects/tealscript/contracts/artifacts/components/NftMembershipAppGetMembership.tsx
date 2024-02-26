/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { NftMembershipApp, NftMembershipAppClient } from '../contracts/NftMembershipAppClient'
import { useWallet } from '@txnlab/use-wallet'

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
type NftMembershipAppGetMembershipArgs = NftMembershipApp['methods']['getMembership(pay,axfer)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: NftMembershipAppClient
  payment: NftMembershipAppGetMembershipArgs['payment']
  nftOptIn: NftMembershipAppGetMembershipArgs['nftOptIn']
}

const NftMembershipAppGetMembership = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling getMembership`)
    await props.typedClient.getMembership(
      {
        payment: props.payment,
        nftOptIn: props.nftOptIn,
      },
      { sender },
    )
    setLoading(false)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default NftMembershipAppGetMembership