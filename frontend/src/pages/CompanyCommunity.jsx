import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CompanyReviews from '../components/company/CompanyReviews';
import CompanyQA from '../components/company/CompanyQA';
import OpenApplicationModal from '../components/company/OpenApplicationModal';

export default function CompanyCommunity() {
	const { companyId } = useParams();
	const [openModal, setOpenModal] = useState(false);

	return (
		<main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
			<div className="mx-auto max-w-5xl space-y-10">
				<header className="rounded-3xl bg-blue-600 p-8 text-white shadow-lg shadow-blue-600/15">
					<div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
						<div>
							<p className="text-sm font-bold uppercase tracking-widest text-blue-100">Company profile</p>
							<h1 className="mt-2 text-3xl font-black">Community Feedback</h1>
							<p className="mt-2 max-w-xl text-blue-100">Read employee reviews and ask the employer questions.</p>
						</div>

						<button
							type="button"
							onClick={() => setOpenModal(true)}
							className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-md transition hover:bg-blue-50"
						>
							Drop Your Resume / Open Application
							<ArrowRight className="h-4 w-4" />
						</button>
					</div>
				</header>

				<CompanyReviews companyId={companyId} />
				<CompanyQA companyId={companyId} />
			</div>

			<OpenApplicationModal companyId={companyId} isOpen={openModal} onClose={() => setOpenModal(false)} />
		</main>
	);
}
