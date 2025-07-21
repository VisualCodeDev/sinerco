import { useState } from "react";

const Carousel = (props) => {
    const { slides } = props;
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="w-full min-h-[280px] flex justify-between items-center gap-4 p-4 md:p-10 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 h-full">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div>{slides[currentIndex].body}</div>
                    <div className="text-xl font-medium">
                        {slides[currentIndex].content}
                    </div>
                </div>
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
            >
                ◀
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
            >
                ▶
            </button>
        </div>
    );
};

export default Carousel;
