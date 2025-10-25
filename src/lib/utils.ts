import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
	if (address.length <= 10) return address;
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generateExplorerLink(address: string, type: 'account' | 'tx') {
	let baseUrl = 'https://flow-view-source.com';

	if (import.meta.env.VITE_NETWORK === 'testnet') {
		baseUrl = 'https://testnet.flowscan.io';
	} else if (import.meta.env.VITE_NETWORK === 'emulator') {
		baseUrl = '#';
	}
	return `${baseUrl}/${type}/${address}`;
}
