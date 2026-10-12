import type { SimulationHost, SimulationState } from '../common/rtlSimulation.js';
export function createSimulationHost(notify: (state: SimulationState) => void, workerFile?: string, bridge?: string): SimulationHost;
