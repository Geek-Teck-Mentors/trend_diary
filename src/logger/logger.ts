import pino from "pino";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogMessage = string | Record<string, unknown>;
export type LogContext = Record<string, unknown>;

class Logger {
  private readonly logger: pino.Logger;
  private readonly context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
    this.logger = pino({
      level: import.meta.env.PROD ? "info" : "debug",
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: () => `,"time":${Date.now()}`,
      messageKey: "msg",
      // * pinoでエラーを表示する場合に使用する
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
      },
    });
  }

  with(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  private log(level: LogLevel, message: LogMessage, ...args: unknown[]): void {
    if (typeof message === "string") {
      this.logger[level](this.context, message, ...args);
    } else {
      this.logger[level]({ ...this.context, ...message });
    }
  }

  debug(message: LogMessage, ...args: unknown[]): void {
    this.log("debug", message, ...args);
  }
  info(message: LogMessage, ...args: unknown[]): void {
    this.log("info", message, ...args);
  }
  warn(message: LogMessage, ...args: unknown[]): void {
    this.log("warn", message, ...args);
  }
  error(message: LogMessage, ...args: unknown[]): void {
    this.log("error", message, ...args);
  }
}

export const logger = new Logger();
