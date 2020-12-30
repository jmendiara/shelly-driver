import { ShellyDevice } from './base';
import { ShellyModelIdentifier } from './model';

/** Contains all the implemented devices for discovering */
export const deviceMap = new Map<ShellyModelIdentifier, typeof ShellyDevice>();
