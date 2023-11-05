export default class Bitmasker<E> {
  private flags: number;

  constructor() {
    this.flags = 0;
  }

  // Sets a flag corresponding to an enum value
  public set(...flags: E[]): void {
    for (const flag of flags) {
      const f = Number(flag);

      if (f >= 0) {
        this.flags |= (1 << f);
      } else {
        this.flags &= ~(1 << (~f));
      }
    }
  }

  // Clears a flag corresponding to an enum value
  public unset(...flags: E[]): void {
    if (flags.length === 0) {
      this.flags = 0;
      return;
    }

    for (const flag of flags) {
      this.flags &= ~(1 << Number(flag));
    }
  }

  // Toggles a flag corresponding to an enum value
  public toggle(...flags: E[]): void {
    for (const flag of flags) {
      this.flags ^= (1 << Number(flag));
    }
  }

  // Checks if a flag corresponding to an enum value is set
  public has(flag: E): boolean {
    const f = Number(flag);
    if (f >= 0) {
      return (this.flags & (1 << f)) !== 0;
    } else {
      return (this.flags & (1 << (~f))) === 0;
    }
  }

  // Checks if multiple flags corresponding to enum values are set
  public all(...flags: E[]): boolean {
    for (const flag of flags) {
      if (!this.has(flag)) {
        return false;
      }
    }
    return true;
  }

  public some(...flags: E[]): boolean {
    let val = false;
    for (const flag of flags) {
      val ||= this.has(flag);
    }
    return val;
  }
}


export class BasicBitmask {
  private flags: number;

  constructor() {
    this.flags = 0;
  }

  // Sets a flag corresponding to an enum value
  set(flag: number): void {
    this.flags |= (1 << flag);
  }

  // Clears a flag corresponding to an enum value
  clear(flag: number): void {
    this.flags &= ~(1 << flag);
  }

  // Toggles a flag corresponding to an enum value
  toggle(flag: number): void {
    this.flags ^= (1 << flag);
  }

  // Checks if a flag corresponding to an enum value is set
  has(flag: number): boolean {
    return (this.flags & (1 << flag)) !== 0;
  }

  // Gets the current flags value
  getValue(): number {
    return this.flags;
  }
}
