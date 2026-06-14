export class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownPeriod = options.cooldownPeriod || 30000; // 30s cooldown
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
    this.failures = [];
    this.lastStateChange = Date.now();
  }

  async execute(action, fallback) {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastStateChange > this.cooldownPeriod) {
        this.setState('HALF-OPEN');
      } else {
        if (fallback) return fallback();
        throw new Error(`Circuit breaker [${this.name}] is OPEN. Requests blocked.`);
      }
    }

    try {
      const result = await action();
      if (this.state === 'HALF-OPEN') {
        this.setState('CLOSED');
        this.failures = [];
      }
      return result;
    } catch (err) {
      this.recordFailure();
      if (fallback) return fallback();
      throw err;
    }
  }

  recordFailure() {
    const now = Date.now();
    this.failures.push(now);
    
    // Clean up failures outside rolling window (e.g., last 60 seconds)
    const rollingWindow = now - 60000;
    this.failures = this.failures.filter(t => t > rollingWindow);

    if (this.failures.length >= this.failureThreshold) {
      this.setState('OPEN');
    }
  }

  setState(state) {
    this.state = state;
    this.lastStateChange = Date.now();
    console.warn(`[CIRCUIT_BREAKER] [${this.name}] state changed to: ${state}`);
  }
}
