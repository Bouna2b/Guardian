export function GuardianScoreCard({ score }: { score: number }) {
  return (
    <div className="glass p-6">
      <h3 className="text-lg">Guardian Score</h3>
      <div className="mt-4 text-5xl font-semibold text-cyan-500">{score}</div>
    </div>
  );
}
