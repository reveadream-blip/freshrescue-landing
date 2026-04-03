import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export default function CountdownTimer({ deadline }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(deadline);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(t('expired'));
        setIsExpired(true);
        return;
      }

      const totalMins = Math.floor(diff / 60000);
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;

      setIsUrgent(totalMins < 30);

      if (hours > 0) {
        setTimeLeft(`${hours}${t('hours')} ${mins}${t('minutes')}`);
      } else {
        setTimeLeft(`${mins} ${t('minutes')}`);
      }
    };

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold ${
      isExpired ? 'text-muted-foreground' : isUrgent ? 'text-citrus' : 'text-stem'
    }`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{t('collectBefore')} {timeLeft}</span>
    </div>
  );
}