import { v4 as uuidv4 } from 'uuid';
const payloadKeys = new Map();

export function getOrReuseKey(payload) {
    const payloadString = JSON.stringify(payload);
    if (payloadKeys.has(payloadString)) {
        return payloadKeys.get(payloadString);
    }
    const freshKey = uuidv4();
    payloadKeys.set(payloadString, freshKey);
    return freshKey;
}