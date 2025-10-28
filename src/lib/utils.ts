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

export function calculateTimeRemaining(
	endTimestamp: number | string
): string | null {
	const endTime = Number(endTimestamp) * 1000;
	const now = Date.now();
	const diff = endTime - now;

	if (diff <= 0) {
		return null;
	} else {
		const days = Math.floor(diff / 86400000);
		const hours = Math.floor((diff % 86400000) / 3600000);
		const minutes = Math.floor((diff % 3600000) / 60000);
		const seconds = Math.floor((diff % 60000) / 1000);

		const parts = [];
		if (days > 0) parts.push(`${days}d`);
		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);
		if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

		return parts.join(' ');
	}
}
