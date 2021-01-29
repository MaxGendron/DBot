import winston from "winston";

module.exports = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.printf((log: any) => `[${log.level.toUpperCase()}] - ${log.message}`),
});
