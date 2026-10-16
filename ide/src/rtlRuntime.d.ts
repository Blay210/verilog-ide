import type { SimulationHost, SimulationState } from '../common/rtlSimulation.js';
export function createSimulationHost(notify: (state: SimulationState) => void, workerFile?: string, bridge?: string): SimulationHost;
export function createSourceProject(parent: string, name: string): Promise<string>;
export function initializeSourceProject(root: string, name: string): Promise<string>;
