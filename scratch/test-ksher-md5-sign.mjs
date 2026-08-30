import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { buildKsherSignString } from '../api/_helpers/ksher.js';

export function signKsherWithSecret(params, secretKey) {
  const signString = buildKsherSignString(params);
  // Ksher standard MD5: signString + secretKey or signString + '&key=' + secretKey
  return {
    md5_direct_upper: crypto.createHash('md5').update(signString + secretKey, 'utf8').digest('hex').toUpperCase(),
    md5_direct_lower: crypto.createHash('md5').update(signString + secretKey, 'utf8').digest('hex').toLowerCase(),
    md5_key_param_upper: crypto.createHash('md5').update(signString + '&key=' + secretKey, 'utf8').digest('hex').toUpperCase(),
    md5_key_param_lower: crypto.createHash('md5').update(signString + '&key=' + secretKey, 'utf8').digest('hex').toLowerCase()
  };
}

console.log('MD5 Signing functions ready.');
