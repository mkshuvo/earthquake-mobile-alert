import { Buffer } from 'buffer';
import process from 'process';

if (typeof (global as any).Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

if (typeof (global as any).process === 'undefined') {
  (global as any).process = process;
}
