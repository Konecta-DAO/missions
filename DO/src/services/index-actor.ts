import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { getIdentity } from "../identity";
import type { _SERVICE as IndexService } from "./declarations/index/index.did";
import { idlFactory as idlFactoryIndex } from "./declarations/index/index.did";

/** Crea un agente dedicado para el “index” */
const agentPromise = HttpAgent.create({
  host: "https://ic0.app",
  identity: getIdentity(),
});

/** Canister-ID de index (puedes usar ENV si lo necesitas) */
const INDEX_CANISTER_ID = {
  DEV: "q3itu-vqaaa-aaaag-qngyq-cai",
  PROD: "tui2b-giaaa-aaaag-qnbpq-cai",
} as const;

let indexActor: ActorSubclass<IndexService> | undefined;

/** Función aislada para obtener el actor “index” */
export async function getIndexActor(): Promise<ActorSubclass<IndexService>> {
  if (!indexActor) {
    const agent = await agentPromise;
    indexActor = Actor.createActor<IndexService>(idlFactoryIndex, {
      agent,
      canisterId:
        INDEX_CANISTER_ID[(process.env.NODE_ENV as "DEV" | "PROD") ?? "DEV"],
    });
  }
  return indexActor;
}
