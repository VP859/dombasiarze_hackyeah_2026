import MatchmakingForm from './form';

export const metadata = {
  title: 'Matchmaking Społeczny | Podaj Dalej',
  description: 'Zgłoś potrzebę i znajdź innowacje społeczne dopasowane do Twojej gminy.',
};

export default function NeedSubmissionPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-8">
          Małopolski Hub Innowacji Społecznych – &quot;Podaj Dalej&quot;
        </h1>
        <MatchmakingForm />
      </div>
    </main>
  );
}