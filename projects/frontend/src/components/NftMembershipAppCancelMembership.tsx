/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { NftMembershipAppClient } from '../contracts/NftMembershipAppClient'
import { useWallet } from '@txnlab/use-wallet'
import React from 'react'
import { microAlgos } from '@algorandfoundation/algokit-utils'

/* Example usage
<NftMembershipAppCancelMembership
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call cancelMembership"
  typedClient={typedClient}
/>
*/
type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: NftMembershipAppClient
  setIsMember: (isMember: boolean) => void
}

const NftMembershipAppCancelMembership = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling cancelMembership`)
    await props.typedClient.cancelMembership({}, { sender, sendParams: { fee: microAlgos(3_000) } })
    setLoading(false)
    props.setIsMember(false)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default NftMembershipAppCancelMembership
