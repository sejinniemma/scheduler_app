'use client';
import { useRef, useState, useEffect } from 'react';

interface TimePickerWheelProps {
  onChange?: (hour: number, minute: number) => void;
}

interface ScrollableRef extends React.RefObject<HTMLDivElement> {
  scrollTimer?: NodeJS.Timeout;
}

export default function TimePickerWheel({ onChange }: TimePickerWheelProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(35);

  const hourRef = useRef<HTMLDivElement>(null) as ScrollableRef;
  const minRef = useRef<HTMLDivElement>(null) as ScrollableRef;

  const ITEM_HEIGHT = 36; // UI 이미지 기준으로 알맞게 조정

  const scrollToIndex = (ref: ScrollableRef, index: number) => {
    ref.current?.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: 'smooth',
    });
  };

  const onScrollEnd = (ref: ScrollableRef, type: 'hour' | 'min') => {
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);

    if (type === 'hour') {
      setHour(index);
      onChange?.(index, minute);
    } else {
      setMinute(index);
      onChange?.(hour, index);
    }

    // 스냅
    scrollToIndex(ref, index);
  };

  useEffect(() => {
    scrollToIndex(hourRef, hour);
    scrollToIndex(minRef, minute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='w-full h-[120px] flex justify-between items-center border rounded-xl py-[18px] px-[50px] bg-white border-line-edge'>
      <div className='text-caption1 font-semibold text-normal-strong mb-2'>
        도착예정시간
      </div>

      <div className='flex justify-center gap-10 relative'>
        {/* HOUR */}
        <div
          ref={hourRef}
          className='h-[108px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide'
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={() => {
            if (hourRef.scrollTimer) {
              clearTimeout(hourRef.scrollTimer);
            }
            hourRef.scrollTimer = setTimeout(
              () => onScrollEnd(hourRef, 'hour'),
              120
            );
          }}
        >
          <div className='py-[36px]'>
            {hours.map((h) => {
              const isActive = h === hour;
              const isNextToActive = h === hour + 1;
              return (
                <div
                  key={h}
                  className={`
                    h-[36px] flex items-center justify-center 
                    snap-center
                    ${!isNextToActive ? 'border-b border-line-base' : ''}
                    ${
                      isActive
                        ? 'text-body3 text-blue font-bold'
                        : 'text-body4 text-disabled-dark'
                    }
                  `}
                >
                  {String(h).padStart(2, '0')}
                </div>
              );
            })}
          </div>
        </div>

        {/* MINUTES */}
        <div
          ref={minRef}
          className='h-[108px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide'
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={() => {
            if (minRef.scrollTimer) {
              clearTimeout(minRef.scrollTimer);
            }
            minRef.scrollTimer = setTimeout(
              () => onScrollEnd(minRef, 'min'),
              120
            );
          }}
        >
          <div className='py-[36px]'>
            {minutes.map((m) => {
              const isActive = m === minute;
              const isNextToActive = m === minute + 1;
              return (
                <div
                  key={m}
                  className={`
                    h-[36px] flex items-center justify-center 
                    snap-center
                    ${!isNextToActive ? 'border-b border-line-base' : ''}
                    ${
                      isActive
                        ? 'text-body3 text-blue font-bold'
                        : 'text-body4 text-disabled-dark'
                    }
                  `}
                >
                  {String(m).padStart(2, '0')}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
