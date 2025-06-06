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
            color: "#E0E0E0", // abu-abu
        });
    }

    let cumulative = 0;

    return (
        <div className="flex flex-col items-center w-max">
            <div className="mb-2">
                <h1 className="font-bold text-lg">{chartData[0]?.label}</h1>
            </div>
            <div className="flex items-center relative w-max">
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
                                strokeLinecap="butt"
                                transform={`rotate(-90 ${center} ${center})`}
                            />
                        );
                    })}
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-bold font-lato text-lg">
                            {percentage.toFixed(2)}%
                        </span>
                        <span className="font-bold font-lato text-xs">
                            ({chartData[0]?.value} unit)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PieChart;
