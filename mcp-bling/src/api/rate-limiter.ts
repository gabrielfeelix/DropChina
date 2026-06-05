/**
 * Rate limiter simples por janela deslizante.
 * Bling permite no máx. 3 req/s. Mantemos uma folga (default 3) e serializamos
 * as chamadas para nunca estourar — evita 429 e bloqueio de IP.
 */
export class RateLimiter {
  private readonly timestamps: number[] = []
  private chain: Promise<void> = Promise.resolve()

  constructor(
    private readonly maxPerWindow = 3,
    private readonly windowMs = 1000,
  ) {}

  /** Garante que a próxima chamada respeite o limite, esperando se preciso. */
  async acquire(): Promise<void> {
    // Serializa as aquisições para o cálculo da janela ser consistente.
    const run = this.chain.then(() => this.waitForSlot())
    this.chain = run.catch(() => {})
    return run
  }

  private async waitForSlot(): Promise<void> {
    const now = Date.now()
    // Descarta timestamps fora da janela.
    while (this.timestamps.length && now - this.timestamps[0] >= this.windowMs) {
      this.timestamps.shift()
    }
    if (this.timestamps.length >= this.maxPerWindow) {
      const waitMs = this.windowMs - (now - this.timestamps[0]) + 5
      await new Promise((r) => setTimeout(r, waitMs))
      return this.waitForSlot()
    }
    this.timestamps.push(Date.now())
  }
}

export const blingRateLimiter = new RateLimiter(3, 1000)
