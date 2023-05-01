import {
  ChainId,
  coalesceChainName,
  parseTokenBridgeRegisterChainVaa,
} from "@certusone/wormhole-sdk";
import {
  JsonRpcProvider,
  TransactionBlock,
  getObjectFields,
  getTransactionDigest,
} from "@mysten/sui.js";
import dotenv from "dotenv";
import fs from "fs";
import yargs from "yargs";
import {
  GOVERNANCE_CHAIN,
  GOVERNANCE_EMITTER,
  INITIAL_GUARDIAN_DEVNET,
  RPC_OPTIONS,
} from "../../consts";
import { NETWORKS } from "../../networks";
import {
  executeTransactionBlock,
  getCreatedObjects,
  getProvider,
  getPublishedPackageId,
  getSigner,
  isSameType,
  logPublishedPackageId,
  logTransactionDigest,
  registerChain,
} from "../../sui";
import { YargsAddCommandsFn } from "../Yargs";
import { deploy } from "./deploy";
import { initExampleApp, initTokenBridge, initWormhole } from "./init";

export const addSetupCommands: YargsAddCommandsFn = (y: typeof yargs) =>
  y.command(
    "setup-devnet",
    "Setup devnet by deploying and initializing core and token bridges and submitting chain registrations.",
    (yargs) => {
      return yargs
        .option("private-key", {
          alias: "k",
          describe: "Custom private key to sign txs",
          required: false,
          type: "string",
        })
        .option("rpc", RPC_OPTIONS);
    },
    async (argv) => {
      const network = "DEVNET";
      const overwriteIds = argv["overwrite-ids"];
      const privateKey = argv["private-key"];
      const rpc = argv.rpc ?? NETWORKS[network].sui.rpc;

      // Deploy core bridge
      console.log("[1/4] Deploying core bridge...");
      const coreBridgeDeployRes = await deploy(
        network,
        "wormhole",
        rpc,
        privateKey
      );
      if (coreBridgeDeployRes?.effects?.status.status !== "success") {
        const coreBridgeDeployResStr = JSON.stringify(coreBridgeDeployRes);
        throw new Error(
          `Core bridge deployment failed. Response: ${coreBridgeDeployResStr}`
        );
      }

      logTransactionDigest(coreBridgeDeployRes);
      logPublishedPackageId(coreBridgeDeployRes);

      // Init core bridge
      console.log("\n[2/4] Initializing core bridge...");
      const coreBridgePackageId = getPublishedPackageId(coreBridgeDeployRes);
      const coreBridgeInitRes = await initWormhole(
        network,
        coreBridgePackageId,
        INITIAL_GUARDIAN_DEVNET,
        GOVERNANCE_CHAIN,
        GOVERNANCE_EMITTER,
        rpc,
        privateKey
      );
      const coreBridgeStateObjectId = getCreatedObjects(coreBridgeInitRes).find(
        (e) => isSameType(e.type, `${coreBridgePackageId}::state::State`)
      ).objectId;
      if (coreBridgeInitRes?.effects?.status.status !== "success") {
        const coreBridgeInitResStr = JSON.stringify(coreBridgeInitRes);
        throw new Error(
          `Core bridge initialization failed. Response: ${coreBridgeInitResStr}`
        );
      }

      logTransactionDigest(coreBridgeInitRes);
      console.log("Core bridge state object ID", coreBridgeStateObjectId);

      // Deploy token bridge
      console.log("\n[3/4] Deploying token bridge...");
      const tokenBridgeDeployRes = await deploy(
        network,
        "token_bridge",
        rpc,
        privateKey
      );
      if (tokenBridgeDeployRes?.effects?.status.status !== "success") {
        const tokenBridgeDeployResStr = JSON.stringify(tokenBridgeDeployRes);
        throw new Error(
          `Token bridge deployment failed. Response: ${tokenBridgeDeployResStr}`
        );
      }

      logTransactionDigest(tokenBridgeDeployRes);
      logPublishedPackageId(tokenBridgeDeployRes);

      // Init token bridge
      console.log("\n[4/4] Initializing token bridge...");
      const tokenBridgePackageId = getPublishedPackageId(tokenBridgeDeployRes);
      const tokenBridgeInitRes = await initTokenBridge(
        network,
        tokenBridgePackageId,
        coreBridgeStateObjectId,
        GOVERNANCE_CHAIN,
        GOVERNANCE_EMITTER,
        rpc,
        privateKey
      );
      const tokenBridgeStateObjectId = getCreatedObjects(
        tokenBridgeInitRes
      ).find((e) =>
        isSameType(e.type, `${tokenBridgePackageId}::state::State`)
      ).objectId;
      if (tokenBridgeInitRes?.effects?.status.status !== "success") {
        const tokenBridgeInitResStr = JSON.stringify(tokenBridgeInitRes);
        throw new Error(
          `Token bridge initialization failed. Response: ${tokenBridgeInitResStr}`
        );
      }

      logTransactionDigest(tokenBridgeInitRes);
      console.log("Token bridge state object ID", tokenBridgeStateObjectId);

      // Deploy example app
      console.log("\n[+1/3] Deploying example app...");
      const exampleAppDeployRes = await deploy(
        network,
        "examples/core_messages",
        rpc,
        privateKey
      );
      logTransactionDigest(tokenBridgeDeployRes);
      logPublishedPackageId(tokenBridgeDeployRes);

      // Init example app
      console.log("\n[+2/3] Initializing example app...");
      const exampleAppPackageId = getPublishedPackageId(exampleAppDeployRes);
      const exampleAppInitRes = await initExampleApp(
        network,
        exampleAppPackageId,
        coreBridgeStateObjectId,
        rpc,
        privateKey
      );
      const exampleAppStateObjectId = getCreatedObjects(exampleAppInitRes).find(
        (e) => isSameType(e.type, `${exampleAppPackageId}::sender::State`)
      ).objectId;
      logTransactionDigest(exampleAppInitRes);
      console.log("Example app state object ID", exampleAppStateObjectId);

      // Deploy example coins
      console.log("\n[+3/3] Deploying example coins...");
      const coinsDeployRes = await deploy(
        network,
        "examples/coins",
        rpc,
        privateKey
      );
      logTransactionDigest(coinsDeployRes);
      logPublishedPackageId(coinsDeployRes);

      // Print publish message command for convenience
      let publishCommand = `\nPublish message command: worm sui publish-example-message -n devnet -p "${exampleAppPackageId}" -s "${exampleAppStateObjectId}" -w "${coreBridgeStateObjectId}" -m "hello"`;
      if (argv.rpc) publishCommand += ` -r "${argv.rpc}"`;
      if (privateKey) publishCommand += ` -k "${privateKey}"`;
      console.log(publishCommand);

      // Dump summary
      const provider = getProvider(network, rpc);
      const emitterCapObjectId = await getEmitterCapObjectId(
        provider,
        tokenBridgeStateObjectId
      );
      console.log("\nSummary:");
      console.log("  Core bridge package ID", coreBridgePackageId);
      console.log("  Core bridge state object ID", coreBridgeStateObjectId);
      console.log("  Token bridge package ID", tokenBridgePackageId);
      console.log("  Token bridge state object ID", tokenBridgeStateObjectId);
      console.log("  Token bridge emitter cap ID", emitterCapObjectId);

      // Chain registrations
      console.log("\nChain registrations:");

      const envPath = `${process.cwd()}/.env`;
      if (!fs.existsSync(envPath)) {
        throw new Error(`Couldn't find .env file at ${envPath}.`);
      }

      dotenv.config({ path: envPath });
      const signer = getSigner(provider, network, privateKey);
      const tx = new TransactionBlock();
      tx.setGasBudget(10000000000);
      const registrations = [];
      for (const key in process.env) {
        if (/^REGISTER_(.+)_TOKEN_BRIDGE_VAA$/.test(key)) {
          // Get VAA info
          const vaa = Buffer.from(String(process.env[key]), "hex");
          const { foreignChain, module } =
            parseTokenBridgeRegisterChainVaa(vaa);
          const chain = coalesceChainName(foreignChain as ChainId);
          registrations.push({ chain, module });

          // Register
          await registerChain(
            provider,
            network,
            vaa,
            coreBridgeStateObjectId,
            tokenBridgeStateObjectId,
            tx
          );
        }
      }

      const registerRes = await executeTransactionBlock(signer, tx);

      // Throw if registration failed, otherwise it fails silently
      if (registerRes?.effects?.status.status !== "success") {
        const registerResStr = JSON.stringify(registerRes);
        throw new Error(
          `Chain registrations failed. Response: ${registerResStr}`
        );
      }

      // Log registered bridges
      for (const registration of registrations) {
        console.log(`  ${registration.chain} ${registration.module}... done`);
      }

      console.log("Transaction digest:", getTransactionDigest(registerRes));

      // Done!
      console.log("\nDone!");
    }
  );

const getEmitterCapObjectId = async (
  provider: JsonRpcProvider,
  tokenBridgeStateObjectId: string
): Promise<string> => {
  return getObjectFields(
    await provider.getObject({
      id: tokenBridgeStateObjectId,
      options: {
        showContent: true,
      },
    })
  ).emitter_cap.fields.id.id;
};
