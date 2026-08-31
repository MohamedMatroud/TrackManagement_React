import { HttpClient } from '../../../core/api/HttpClient'
import type { Dsp } from '../types'

export class DspClient extends HttpClient {
  list(signal?: AbortSignal) {
    return this.get<Dsp[]>('/dsps', { signal })
  }
}

export const dspClient = new DspClient()
