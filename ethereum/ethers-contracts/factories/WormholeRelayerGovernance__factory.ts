/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  WormholeRelayerGovernance,
  WormholeRelayerGovernanceInterface,
} from "../WormholeRelayerGovernance";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "failure",
        type: "bytes",
      },
    ],
    name: "ContractUpgradeFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
    ],
    name: "GovernanceActionAlreadyConsumed",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidFork",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "parsed",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "expected",
        type: "uint16",
      },
    ],
    name: "InvalidGovernanceChainId",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "parsed",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "expected",
        type: "bytes32",
      },
    ],
    name: "InvalidGovernanceContract",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "InvalidGovernanceVM",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "parsed",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "expected",
        type: "uint8",
      },
    ],
    name: "InvalidPayloadAction",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "parsed",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "expected",
        type: "uint16",
      },
    ],
    name: "InvalidPayloadChainId",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "received",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
    ],
    name: "InvalidPayloadLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "parsed",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "expected",
        type: "bytes32",
      },
    ],
    name: "InvalidPayloadModule",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "NotAnEvmAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousAdmin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beacon",
        type: "address",
      },
    ],
    name: "BeaconUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "sequence",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "LocalNative",
        name: "deliveryQuote",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "LocalNative",
        name: "paymentForExtraReceiverValue",
        type: "uint256",
      },
    ],
    name: "SendEvent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "checkAndExecuteUpgradeMigration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "chainId",
        type: "uint16",
      },
    ],
    name: "getRegisteredWormholeRelayerContract",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "encodedVm",
        type: "bytes",
      },
    ],
    name: "registerWormholeRelayerContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "encodedVm",
        type: "bytes",
      },
    ],
    name: "setDefaultDeliveryProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "encodedVm",
        type: "bytes",
      },
    ],
    name: "submitContractUpgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class WormholeRelayerGovernance__factory {
  static readonly abi = _abi;
  static createInterface(): WormholeRelayerGovernanceInterface {
    return new utils.Interface(_abi) as WormholeRelayerGovernanceInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WormholeRelayerGovernance {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as WormholeRelayerGovernance;
  }
}