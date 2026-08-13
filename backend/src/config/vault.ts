import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import dotenv from 'dotenv';

// Load local .env fallback
dotenv.config();

export interface AppConfig {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  GEMINI_API_KEY: string;
  MY_PEER_API_KEY: string;
  THEIR_PEER_API_KEY: string;
  SPACE_RESERVE_API_URL: string;
}

const config: Partial<AppConfig> = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MY_PEER_API_KEY: process.env.MY_PEER_API_KEY || 'fp_peer_api_key_xyz_998877',
  THEIR_PEER_API_KEY: process.env.THEIR_PEER_API_KEY || 'sr_peer_token_88192a_sec',
  SPACE_RESERVE_API_URL: process.env.SPACE_RESERVE_API_URL || 'https://spacereserve.uni.edu/api/v1'
};

export async function initConfig(): Promise<AppConfig> {
  const vaultUrl = process.env.AZURE_KEY_VAULT_URL;

  if (vaultUrl) {
    console.log(`[Vault] Azure Key Vault URL detected: ${vaultUrl}. Fetching secrets...`);
    try {
      // Use DefaultAzureCredential (looks at AZURE_CLIENT_ID, CLIENT_SECRET, TENANT_ID env vars)
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(vaultUrl, credential);

      // Fetch secrets at runtime
      const dbUrlSecret = await client.getSecret('DATABASE-URL').catch(() => null);
      if (dbUrlSecret?.value) {
        config.DATABASE_URL = dbUrlSecret.value;
        process.env.DATABASE_URL = dbUrlSecret.value; // ensure Prisma uses it
      }

      const jwtSecret = await client.getSecret('JWT-SECRET').catch(() => null);
      if (jwtSecret?.value) config.JWT_SECRET = jwtSecret.value;

      const geminiSecret = await client.getSecret('GEMINI-API-KEY').catch(() => null);
      if (geminiSecret?.value) config.GEMINI_API_KEY = geminiSecret.value;

      console.log('[Vault] Central secrets loaded successfully from Azure Key Vault!');
    } catch (err: any) {
      console.warn(`[Vault Warning] Failed to fetch secrets from Azure Key Vault: ${err.message}. Falling back to local env.`);
    }
  } else {
    console.log('[Vault] No Azure Key Vault configured. Running in Local Dev Mode.');
  }

  // Validate critical configurations
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL config is missing. Setup local .env or configure Azure Key Vault.');
  }
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET config is missing. Setup local .env or configure Azure Key Vault.');
  }

  return config as AppConfig;
}

export function getConfig(): AppConfig {
  return config as AppConfig;
}
