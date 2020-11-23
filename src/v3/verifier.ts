import { isEmpty } from "ramda"
import ConfigurationError from "../errors/configurationError"
import logger from "../common/logger"

const PactNative = require("../native/index.node")

// Commented out fields highlight areas we need to look at for compatibility
// with existing API, as a sort of "TODO" list.
export interface VerifierV3Options {
  provider: string
  logLevel: string
  providerBaseUrl: string
  pactUrls?: string[]
  pactBrokerUrl?: string
  providerStatesSetupUrl?: string
  pactBrokerUsername?: string
  pactBrokerPassword?: string
  pactBrokerToken?: string
  // customProviderHeaders?: string[]
  publishVerificationResult?: boolean
  providerVersion?: string
  requestFilter?: (req: any) => any
  stateHandlers?: any

  consumerVersionTags?: string | string[]
  providerVersionTags?: string | string[]
  // consumerVersionSelectors?: ConsumerVersionSelector[];
  enablePending?: boolean
  // timeout?: number;
  // verbose?: boolean;
  includeWipPactsSince?: string
  // out?: string;
  // logDir?: string;
  // logLevel?: LogLevel;
}

export interface ConsumerVersionSelector {
  pacticipant?: string
  tag?: string
  version?: string
  latest?: boolean
  all?: boolean
}

export class VerifierV3 {
  private config: VerifierV3Options

  constructor(config: VerifierV3Options) {
    this.config = config
  }

  /**
   * Verify a HTTP Provider
   */
  public verifyProvider(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isEmpty(this.config)) {
        reject(new ConfigurationError("No configuration provided to verifier"))
      }
      if (!this.config.provider) {
        reject(new ConfigurationError("Provider name is required"))
      }
      if (isEmpty(this.config.pactUrls) && !this.config.pactBrokerUrl) {
        reject(
          new ConfigurationError(
            "Either a list of pactUrls or a pactBrokerUrl must be provided"
          )
        )
      }

      try {
        PactNative.verify_provider(this.config, (err: any, val: any) => {
          if (err || !val) {
            logger.debug("In verify_provider callback: FAILED with", err, val)
            reject(err)
          } else {
            logger.debug("In verify_provider callback: SUCCEEDED with", val)
            resolve(val)
          }
        })
        logger.debug("Submitted test to verify_provider")
      } catch (e) {
        reject(e)
      }
    })
  }
}
