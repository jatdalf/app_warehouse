import { useEffect, useState } from "react";

interface Props {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
}

const AnimatedNumber: React.FC<Props> = ({
    value,
    duration = 1500,
    decimals = 0,
    prefix = "",
    suffix = ""
}) => {

    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        let animationFrame: number;
        const startTime = performance.now();
        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = value * easedProgress;
            setDisplayValue(currentValue);
            if (progress < 1) {animationFrame = requestAnimationFrame(animate);
            }
        };
        setDisplayValue(0);
        animationFrame = requestAnimationFrame(animate);

        return () => {cancelAnimationFrame(animationFrame);
        };
    }, [value, duration]);

    return (
        <>
            {prefix}
            {displayValue.toLocaleString("es-AR",{minimumFractionDigits: decimals, maximumFractionDigits: decimals})}
            {suffix}
        </>
    );
};

export default AnimatedNumber;