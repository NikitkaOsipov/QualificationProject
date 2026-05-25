'use client';

interface TimelineProps {
    currentStage: number;
    totalStages: number;
}

const Timeline = ({ currentStage, totalStages }: TimelineProps) => {
    const stages = [
        { number: 1, label: 'Vieta' },
        { number: 2, label: 'Detaļas' },
        { number: 3, label: 'Vizuālais' },
        { number: 4, label: 'Redzamība' },
        { number: 5, label: 'Apstiprināt' },
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
                                    ? 'bg-gradient-to-r from-logo-1 to-logo-3 text-white'
                                    : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            {stage.number <= currentStage ? '✓' : stage.number}
                        </div>

                        {/* Stage Label */}
                        <p
                            className={`mt-2 text-xs font-medium text-center transition-all ${
                                stage.number <= currentStage
                                    ? 'bg-gradient-to-r from-logo-1 to-logo-3 bg-clip-text text-transparent'
                                    : 'text-gray-500'
                            }`}
                        >
                            {stage.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Progress Bar Below */}
            <div className="mt-8 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-logo-1 to-logo-3 transition-all duration-300"
                    style={{ width: `${(currentStage / totalStages) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default Timeline;

