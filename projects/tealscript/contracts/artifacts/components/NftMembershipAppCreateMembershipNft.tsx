/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { NftMembershipApp, NftMembershipAppClient } from '../contracts/NftMembershipAppClient'
import { useWallet } from '@txnlab/use-wallet'

/* Example usage
<NftMembershipAppCreateMembershipNft
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call createMembershipNft"
  typedClient={typedClient}
  name={name}
  total={total}
  unitName={unitName}
  assetUrl={assetUrl}
/>
*/
type NftMembershipAppCreateMembershipNftArgs = NftMembershipApp['methods']['createMembershipNft(string,uint64,string,string)uint64']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: NftMembershipAppClient
  name: NftMembershipAppCreateMembershipNftArgs['name']
  total: NftMembershipAppCreateMembershipNftArgs['total']
  unitName: NftMembershipAppCreateMembershipNftArgs['unitName']
  assetUrl: NftMembershipAppCreateMembershipNftArgs['assetUrl']
}

const NftMembershipAppCreateMembershipNft = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling createMembershipNft`)
    await props.typedClient.createMembershipNft(
      {
        name: props.name,
        total: props.total,
        unitName: props.unitName,
        assetUrl: props.assetUrl,
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

export default NftMembershipAppCreateMembershipNft