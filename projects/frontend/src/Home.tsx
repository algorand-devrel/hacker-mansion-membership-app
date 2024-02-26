// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import { NftMembershipAppClient } from './contracts/NftMembershipAppClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import NftMembershipAppCreateApplication from './components/NftMembershipAppCreateApplication'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appID, setAppID] = useState<number>(0)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const algodConfig = getAlgodConfigFromViteEnvironment()

  const algodClient = algokit.getAlgoClient({
    server: algodConfig.server,
    port: algodConfig.port,
    token: algodConfig.token,
  })

  const typedClient = new NftMembershipAppClient(
    {
      resolveBy: 'id',
      id: appID,
    },
    algodClient,
  )

  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Welcome to <div className="font-bold">AlgoKit 🙂</div>
          </h1>
          <p className="py-6">
            This starter has been generated using official AlgoKit React template. Refer to the resource below for next steps.
          </p>

          <div className="grid">
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>

            <div className="divider" />

            <h1 className="font-bold m-2">App ID</h1>

            <input
              type="number"
              className="input input-bordered m-2"
              value={appID}
              onChange={(e) => setAppID(e.currentTarget.valueAsNumber || 0)}
            />

            {activeAddress && appID === 0 && (
              <NftMembershipAppCreateApplication
                buttonClass="btn m-2"
                buttonLoadingNode={<span className="loading loading-spinner" />}
                buttonNode="Create Membership App"
                typedClient={typedClient}
                algodClient={algodClient}
                setAppID={setAppID}
              />
            )}

            <div className="divider" />
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
