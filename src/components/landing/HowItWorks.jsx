import { useTranslation } from '../../lib/i18n';
import { Camera, Bell, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { icon: Camera, key: 1, color: 'bg-primary/10 text-primary' },
  { icon: Bell, key: 2, color: 'bg-accent/10 text-accent' },
  { icon: ShoppingBag, key: 3, color: 'bg-stem/10 text-stem' },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">{t('howItWorks')}</h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              {/* Connector line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border/50" />
              )}

              <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8" />
              </div>

              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                {step.key}
              </span>

              <h3 className="text-xl font-bold mb-3">{t(`step${step.key}Title`)}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">{t(`step${step.key}Desc`)}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}