import { Context, Shelly1PMSettingsAttributtes, Shelly1PMStatus } from './model';
import { Shelly1 } from './shelly1';

export class Shelly1PM extends Shelly1 {}

export interface Shelly1PM extends Shelly1 {
  getSettings(context?: Context): Promise<Shelly1PMSettingsAttributtes>;
  getStatus(context?: Context): Promise<Shelly1PMStatus>;
}
