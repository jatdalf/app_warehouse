import { useEffect, useRef, useState } from "react";

export const useCountUp = (
  end: number,
  duration: number = 1200
) => {
  const [count, setCount] = useState(0);

  const countRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancelar inmediatamente cualquier animación anterior
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = countRef.current;

    // Si no hay diferencia, no animamos
    if (startValue === end) {
      return;
    }

    const difference = end - startValue;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      // Ease-out: rápido al principio, suave al final
      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      const nextValue = Math.round(
        startValue + difference * easedProgress
      );

      countRef.current = nextValue;
      setCount(nextValue);

      if (progress < 1) {
        animationRef.current =
          requestAnimationFrame(animate);
      } else {
        countRef.current = end;
        setCount(end);
        animationRef.current = null;
      }
    };

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [end, duration]);

  return count;
};