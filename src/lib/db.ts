import { Redis } from '@upstash/redis'

export const db = new Redis({
	url: "https://eu2-prompt-shiner-31219.upstash.io",
	token:
		"AXnzASQgMGE4ZTlmNjktOTM3Zi00ZDZjLWEzN2YtMzAwZTI2NTc2NDI2NjNiMTljZWVkYjIxNDRhYjgwMDU2YzhkNTUzYTlmNzg=",
});
   
