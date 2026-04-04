'use client';

interface TimelineProps {
    currentStage: number;
    totalStages: number;
}

const Timeline = ({ currentStage, totalStages }: TimelineProps) => {
    const stages = [
        { number: 1, label: 'Location' },
        { number: 2, label: 'Details' },
        { number: 3, label: 'Visuals' },
        { number: 4, label: 'Visibility' },
        { number: 5, label: 'Confirm' },
    ];

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between">
                {stages.map((stage, index) => (
                    <div key={stage.number} className="flex flex-col items-center flex-1">
                        {/* Stage Circle */}
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                                stage.number <= currentStage
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            {stage.number <= currentStage ? '✓' : stage.number}
                        </div>

                        {/* Stage Label */}
                        <p
                            className={`mt-2 text-xs font-medium text-center transition-all ${
                                stage.number <= currentStage ? 'text-blue-600' : 'text-gray-500'
                            }`}
                        >
                            {stage.label}
                        </p>

                        {/* Connecting Line */}
                        {index < stages.length - 1 && (
                            <div
                                className={`absolute h-1 w-full max-w-xs transition-all ${
                                    stage.number < currentStage ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                                style={{
                                    top: '1.5rem',
                                    left: `calc(50% + 1.5rem)`,
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Progress Bar Below */}
            <div className="mt-8 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(currentStage / totalStages) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default Timeline;

