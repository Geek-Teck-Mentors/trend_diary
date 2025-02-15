import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export class UUID {
  private static readonly schema = z.string().uuid();
  private readonly value: string;

  private constructor(value: string) {
    this.value = UUID.schema.parse(value);
  }

  static new(): UUID {
    return new UUID(uuidv4());
  }

  static fromString(value: string): UUID {
    return new UUID(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UUID): boolean {
    return this.value === other.value;
  }

  toJSON(): string {
    return this.value;
  }
}
