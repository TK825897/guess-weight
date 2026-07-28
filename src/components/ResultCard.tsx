interface ResultData {
  correct_weight: number;
  guessed_weight: number;
  difference: number;
  direction: string;
  error_rate: number;
  accuracy: number;
  rank: number;
  total_guessers: number;
  better_percentage: number;
}

interface ResultCardProps {
  result: ResultData;
  onNext: () => void;
}

export default function ResultCard({ result, onNext }: ResultCardProps) {
  const getDirectionColor = () => {
    if (result.direction === '完全正确！') return 'text-green-600';
    if (result.direction === '大了') return 'text-red-500';
    return 'text-blue-500';
  };

  const getAccuracyColor = () => {
    if (result.accuracy >= 90) return 'text-green-600 bg-green-50';
    if (result.accuracy >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="text-center mb-4">
        <div className={`text-3xl font-bold mb-2 ${getDirectionColor()}`}>
          {result.direction}
        </div>
        {result.direction !== '完全正确！' && (
          <p className="text-gray-500">
            差了 <span className="font-semibold text-gray-700">{result.difference.toFixed(1)} kg</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-sm text-gray-500">你的猜测</div>
          <div className="text-xl font-bold text-gray-700">{result.guessed_weight} kg</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="text-sm text-gray-500">正确答案</div>
          <div className="text-xl font-bold text-gray-700">{result.correct_weight} kg</div>
        </div>
      </div>

      <div className={`text-center p-4 rounded-xl mb-4 ${getAccuracyColor()}`}>
        <div className="text-sm opacity-75">本次准确率</div>
        <div className="text-2xl font-bold">{result.accuracy}%</div>
      </div>

      <div className="text-center text-gray-600 mb-6">
        在 {result.total_guessers} 位猜测者中，你比 <span className="font-bold text-blue-600">{result.better_percentage}%</span> 的人更接近
        <div className="text-sm text-gray-400 mt-1">排名第 {result.rank} / {result.total_guessers}</div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition"
      >
        猜下一张
      </button>
    </div>
  );
}
