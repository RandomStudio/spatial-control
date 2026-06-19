/**
 * Types for the Open Stage Control custom-module runtime.
 *
 * Open Stage Control evaluates the built module in a sandbox that injects a few
 * globals (`send`, `receive`, `console`). We declare them here so the TypeScript
 * source type-checks; they are provided at runtime by Open Stage Control, not by us.
 *
 * Docs: https://openstagecontrol.ammd.net/docs/custom-module/custom-module/
 */

export {}; // make this file a module so `declare global` augments the global scope

declare global {
  /** Send an OSC message out to host:port. */
  function send(
    host: string,
    port: number,
    address: string,
    ...args: Array<number | string>
  ): void;

  /** Inject an OSC message as if it had arrived, to update widgets in the UI. */
  function receive(address: string, ...args: Array<number | string>): void;
}

/** An OSC argument as seen inside the filters: either a raw value or a typed wrapper. */
export type OscArg = number | string | { type: string; value: number | string };

/** Payload passed to oscInFilter / oscOutFilter. */
export interface OscData {
  address: string;
  args: OscArg[];
  host: string;
  port: number;
  clientId?: string;
}

/** Shape Open Stage Control expects from `module.exports`. */
export interface CustomModule {
  init?: () => void;
  /** Return data to forward, or nothing to drop the message. */
  oscInFilter?: (data: OscData) => OscData | void;
  oscOutFilter?: (data: OscData) => OscData | void;
  unload?: () => void;
}
