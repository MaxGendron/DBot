import winston = require('winston');

export class CustomLogger {
  private logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.printf((log) => `[${log.level.toUpperCase()}] - ${log.message}`),
  });

  public logInfo(message: string): void {
    this.logger.log('info', message)
  }

  public logWarn(message: string): void {
    this.logger.log('warn', message)
  }

  public logError(message: Error | string): void {
    this.logger.log('error', message)
  }
}