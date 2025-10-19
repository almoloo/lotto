import { AppRouter } from './lib/router';
import { FlowProvider } from '@onflow/react-sdk';
import flowJSON from '../flow.json';

function App() {
	return (
		<FlowProvider
			config={{
				accessNodeUrl: import.meta.env.VITE_ACCESS_NODE_URL,
				flowNetwork: import.meta.env.VITE_NETWORK,
				discoveryWallet: import.meta.env.VITE_DISCOVERY_WALLET_URL,
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
