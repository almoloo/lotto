import { Outlet } from 'react-router';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="xl:grid xl:grid-cols-12 flex-grow gap-20 px-5 xl:p-0">
				<div className="hidden xl:block col-span-1 xl:col-span-3 bg-gradient-to-l from-emerald-100 to-emerald-500 rounded-r-4xl opacity-25 border border-emerald-200"></div>
				<div className="col-span-10 xl:col-span-6">
					<Outlet />
				</div>
				<div className="hidden xl:block col-span-1 xl:col-span-3 bg-gradient-to-r from-emerald-100 to-emerald-500 rounded-l-4xl opacity-25 border border-emerald-200"></div>
			</main>
			<Footer />
			<Toaster position="top-center" />
		</div>
	);
}
