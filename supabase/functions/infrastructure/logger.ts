import * as log from "jsr:@std/log";


log.setup({
  handlers: {
    default: new log.ConsoleHandler("INFO", {
      formatter: log.formatters.jsonFormatter,
      useColors: false,
    }),
  }
})

export const logger = log.getLogger();
