import { ServerEvents } from "@nodepolus/framework/src/api/events";
import { BasePlugin, PluginMetadata } from "@nodepolus/framework/src/api/plugin";
import { Connection } from "@nodepolus/framework/src/protocol/connection";
import { Server } from "@nodepolus/framework/src/server";

const pluginMetadata: PluginMetadata = {
  name: "Polus.gg Anticheat",
  version: [1, 0, 0],
  authors: [
    {
      name: "Polus.gg",
      email: "contact@polus.gg",
      website: "https://polus.gg",
    },
    {
      name: "Rose Hall",
      email: "rose@polus.gg",
    },
  ],
  description: "NodePolus plugin to prevent cheating on Polus.gg",
  website: "https://polus.gg",
};

declare const server: Server;

const anticheatFlags = <const> [
  "gameOptions.updated.midGame",
  "gameOptions.updated.nonHost",
  "meeting",
  "meeting.duringMeeting",
  "meeting.movement",
  "meeting.murder",
  "meeting.task",
  "meeting.vote.impersonation",
  "murder.noclip",
  "murder.speed",
  "networking.object.create",
  "networking.object.impersonate",
  "position.noclip",
  "position.speed",
  "sabotage.author",
  "sabotage.repair.distance",
  "sabotage.repair.unsabotaged",
  "sabotage.speed",
  "task.completion.distance",
  "task.completion.invalid",
  "task.completion.noclip",
  "task.completion.speed",
  "vent.enter",
  "vent.exit",
  "vent.exit.undefined",
]

type AnticheatAlert<T extends (typeof anticheatFlags)[number]> = {
  actingOn: Connection;
  data: Record<string, unknown>;
  type: T
};

type Detector<T extends ServerEvents[keyof ServerEvents]> = (event: T) => void | AnticheatAlert<(typeof anticheatFlags)[number]>;

export function registerDetector<T extends (keyof ServerEvents)[]>(...args: [...T, Detector<ServerEvents[T[number]]>]) {
  const detector = args.pop() as Detector<ServerEvents[T[number]]>;

  for (let i = 0; i < args.length; i++) {
    const event = args[i] as T[number];
    
    server.on(event, event => {
      const result = detector(event);

      if (result !== undefined) {
        // Temp. Replace with write to DB, and commit action
        throw new Error(`AnticheatError: ${result.type}`)
      }
    })
  }
}

export default class extends BasePlugin {
  constructor() {
    super(pluginMetadata);
  }
}
