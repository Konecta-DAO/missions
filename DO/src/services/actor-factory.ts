import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { getIdentity } from "../identity";

import type { _SERVICE as MainService } from "./declarations/test_backend/test_backend.did";
import { idlFactory as idlFactoryMain } from "./declarations/test_backend/test_backend.did";

// interface BaseActorContract {
//   dfdfdf: () => ActorMethod<[], undefined>,
//   getVersion: () => Promise<string>;
//   getStatus: () => Promise<{ active: boolean; lastUpdate: bigint }>;
// }

// type ValidateActor<T> = T | BaseActorContract;

// 2) Entorno
const ENV: "DEV" | "PROD" = "DEV";

// 3) Configuración de canisters para contratos
const canisterConfigs = {
  main: {
    idlFactory: idlFactoryMain,
    canisterId: {
      DEV: "ynkdv-7qaaa-aaaag-qkluq-cai",
      PROD: "onpqf-diaaa-aaaag-qkzie-cai",
    },
  },
} as const;

// 4) Mapeo de servicios con validación en tiempo de compilación
type ServiceMap = {
  main: MainService; //ValidateActor<MainService>;
};

type ActorName = keyof ServiceMap;
type ActorMap = { [K in ActorName]: ActorSubclass<ServiceMap[K]> };

// 5) Type‐guard para validar strings en tiempo de ejecución
function isValidContractName(name: string): name is ActorName {
  return name in canisterConfigs;
}

// 6) Agente HTTP compartido
const agentPromise = HttpAgent.create({
  host: "https://ic0.com",
  identity: getIdentity(),
});

// 7) Caché fuertemente tipado
const actorCache: Partial<ActorMap> = {};

// 8) Fábrica con validación de tipos en tiempo de compilación
export async function getContractActorByName<T extends ActorName>(
  name: string
): Promise<ActorSubclass<ServiceMap[T]>> {
  if (!isValidContractName(name)) {
    throw new Error(
      `Actor "${name}" no es válido. Usa uno de: ${Object.keys(
        canisterConfigs
      ).join(", ")}`
    );
  }
  const key = name as ActorName;
  if (!actorCache[key]) {
    const { idlFactory, canisterId } = canisterConfigs[key];
    const agent = await agentPromise;

    actorCache[key] = Actor.createActor<ServiceMap[typeof key]>(
      idlFactory as IDL.InterfaceFactory,
      {
        agent,
        canisterId: canisterId[ENV],
      }
    );
  }
  return actorCache[key]! as ActorSubclass<ServiceMap[T]>;
}
