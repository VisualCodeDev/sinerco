import React from "react";

const MultiRingChart = ({
    data = [],
    size = 140,
    stroke = 10,
    gap = 12,
    showLegend = true,
}) => {
    const center = size / 2;
    const baseRadius = center - stroke;

    return (
        <div className="flex justify-center w-full items-center gap-6 md:gap-10">
            {/* Optional Legend */}
            {showLegend && (
                <div className="flex flex-col gap-4 text-base md:text-xl min-w-[80px]">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 md:gap-8">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm md:text-base text-gray-600">{item.label}</span>
                            <span className="ml-auto font-black">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Concentric Rings */}
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {data.map((item, i) => {
                    const radius = baseRadius - i * gap;
                    const circumference = 2 * Math.PI * radius;
                    const dashLength = (item.value / 100) * circumference;
                    const dashArray = `${dashLength} ${
                        circumference - dashLength
                    }`;

                    return (
                        <React.Fragment key={i}>
                            {/* Gray background circle */}
                            <circle
                                r={radius}
                                cx={center}
                                cy={center}
                                fill="transparent"
                                stroke="#e5e7eb"
                                strokeWidth={stroke}
                                strokeDasharray={circumference}
                                transform={`rotate(-90 ${center} ${center})`}
                            />

                            {/* Colored foreground circle */}
                            <circle
                                r={radius}
                                cx={center}
                                cy={center}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={stroke}
                                strokeDasharray={dashArray}
                                strokeDashoffset={0}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${center} ${center})`}
                                opacity={0.9}
                            />
                        </React.Fragment>
                    );
                })}
            </svg>
        </div>
    );
};

export default MultiRingChart;
