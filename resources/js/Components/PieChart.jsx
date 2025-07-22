const PieChart = ({ data, stroke, size = 200, totalData }) => {
    const strokeWidth = stroke;
    const viewBoxSize = size;
    const center = viewBoxSize / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const total = data.value;
    const gap = totalData && totalData > total ? totalData - total : 0;
    const percentage = (total / totalData) * 100;
    // Gabungkan data dengan slice abu-abu jika perlu
    const chartData = [
        {
            label: data?.label,
            value: data?.value,
            color: data?.color,
        },
    ];
    if (gap > 0) {
        chartData.push({
            label: "Remaining",
            value: gap,
            color: "#e5e7eb", // abu-abu
        });
    }

    let cumulative = 0;

    return (
        <div className="flex flex-row justify-center gap-5 items-center w-full text-center">
            {/* Title and Value */}
            <div className="flex flex-col gap-2 md:gap-3 mb-1 text-start">
                <p className="text-base md:text-xl text-gray-500">Total Unit {chartData[0]?.label}</p>
                <p className="text-2xl md:text-4xl font-bold">
                    {chartData[0]?.value.toLocaleString()}{" "} <span className="text-base md:text-xl">Units</span>
                </p>
            </div>

            <div
                className="relative my-2"
                style={{ width: `${size}px`, height: `${size}px` }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                >
                    {chartData.map((slice, index) => {
                        const value = slice.value;
                        const dashLength = (value / totalData) * circumference;
                        const dashArray = `${dashLength} ${
                            circumference - dashLength
                        }`;
                        const offset = -(
                            (cumulative / totalData) *
                            circumference
                        );
                        const color = slice.color;
                        cumulative += value;

                        return (
                            <circle
                                key={index}
                                r={radius}
                                cx={center}
                                cy={center}
                                fill="transparent"
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={dashArray}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                transform={`rotate(-90 ${center} ${center})`}
                            />
                        );
                    })}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-black">
                        {percentage.toFixed()}%
                    </span>
                </div>
            </div>

        </div>
    );
};
export default PieChart;
