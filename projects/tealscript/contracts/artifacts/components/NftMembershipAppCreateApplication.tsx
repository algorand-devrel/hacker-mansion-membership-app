/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { NftMembershipApp, NftMembershipAppClient } from '../contracts/NftMembershipAppClient'
import { useWallet } from '@txnlab/use-wallet'

/* Example usage
<NftMembershipAppCreateApplication
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call createApplication"
  typedClient={typedClient}
  membershipPrice={membershipPrice}
/>
*/
type NftMembershipAppCreateApplicationArgs = NftMembershipApp['methods']['createApplication(uint64)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: NftMembershipAppClient
  membershipPrice: NftMembershipAppCreateApplicationArgs['membershipPrice']
}

const NftMembershipAppCreateApplication = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling createApplication`)
    await props.typedClient.create.createApplication(
      {
        membershipPrice: props.membershipPrice,
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

export default NftMembershipAppCreateApplication