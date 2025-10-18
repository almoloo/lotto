import { AppRouter } from './lib/router';
import { FlowProvider } from '@onflow/react-sdk';

function App() {
	return (
		<FlowProvider
			config={{
				accessNodeUrl: 'https://access-mainnet.onflow.org',
				flowNetwork: 'mainnet',
				appDetailTitle: 'Lotto Dapp',
				appDetailIcon: 'https://flow.com/favicon.ico',
				appDetailDescription: 'A decentralized lottery application',
				appDetailUrl: 'https://flow.com',
			}}
		>
			<AppRouter />
		</FlowProvider>
	);
}

export default App;
