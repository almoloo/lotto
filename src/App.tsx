import { AppRouter } from './lib/router';
import { FlowProvider } from '@onflow/react-sdk';
import flowJSON from '../flow.json';

function App() {
	return (
		<FlowProvider
			config={{
				accessNodeUrl: 'https://rest-testnet.onflow.org',
				flowNetwork: 'testnet',
				discoveryWallet:
					'https://fcl-discovery.onflow.org/testnet/authn',
				appDetailTitle: 'Lotto Dapp',
				appDetailIcon: 'https://flow.com/favicon.ico',
				appDetailDescription: 'A decentralized lottery application',
				appDetailUrl: import.meta.env.VITE_PUBLIC_URL,
				walletconnectProjectId: import.meta.env
					.VITE_WALLET_CONNECT_PROJECT_ID,
			}}
			colorMode="light"
			flowJson={flowJSON}
		>
			<AppRouter />
		</FlowProvider>
	);
}

export default App;
