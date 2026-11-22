export { createLogger, defaultLogger } from "./logger.js";
export { ConsoleTransport } from "./transports/console.transport.js";
export { serializeContext, serializeError, redactObject } from "./error-serializer.js";

export default defaultLogger;
