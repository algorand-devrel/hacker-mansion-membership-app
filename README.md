# NFT Membership Application on Algorand

This simple application uses a smart contract to distribute membership NFT when users pays for the membership fee by depositing certain amount of Algos. Users can always cancel their membership and get back their Algos they paid for the membership. Once membership is cancelled, the membership NFT is clawbacked and transferred back to the membership smart contract. 

To showcase Algorand Standard Asset (ASA) capabilities, the membership NFT is defaulted to be frozen and able to be clawbacked. 

> [Clawback & freeze feature can be permanently disabled by setting these parameters to an empty string during asset creation or asset configuration.](https://developer.algorand.org/docs/get-details/asa/?from_query=asa#template-modal-overlay:~:text=Freeze%20Address,ever%20being%20frozen.) 

## Development Environment Setup

### Prerequisites

This project assumes you have a local network running on your machine. The easiet way to setup a local network is with [algokit](https://github.com/algorandfoundation/algokit-cli). If you don't have Algokit or its dependencies installed locally you can open this repository in a GitHub codespace via https://codespaces.new and choosing this repo.

1. Install [AlgoKit](https://github.com/algorandfoundation/algokit-cli/tree/main?tab=readme-ov-file#install).
2. Install [Docker](https://www.docker.com/products/docker-desktop/). It is used to run local Algorand network for development.

### Set up your development environment

1. Go to the directory you want to work in with your terminal and clone the repository
```bash
cd [DIRECTORY_OF_YOUR_CHOICE]
git clone [FORKED_REPO_URL]
```
2. Open the cloned repository with the code editor of your choosing. The below code example works only if you are using VSCode as your default editor and have the `code .` shorthand set up.
```bash
cd [CLONED_REPO]
code . 
```
3. Install dependencies using AlgoKit. Run the below command
```bash
algokit bootstrap all
```

## Build & Deploy & Test

### Build Contract

`npm run build` will compile the contract to TEAL and generate an ABI and appspec JSON in [./contracts/artifacts](./contracts/artifacts/) and a algokit TypeScript client in [./contracts/clients](./contracts/clients/).

`npm run compile-contract` or `npm run generate-client` can be used to compile the contract or generate the contract seperately.

### Run Tests

`npm run test` will execute the tests defined in [./\_\_test\_\_](./__test__) 

### Lint

`npm run lint` will lint the contracts and tests with ESLint.


## Documentation

For TEALScript documentation, go to https://tealscript.algo.xyz


