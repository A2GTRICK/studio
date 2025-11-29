
import { EventEmitter } from 'events';

// This is a client-side only event emitter
const errorEmitter = new EventEmitter();

export { errorEmitter };
