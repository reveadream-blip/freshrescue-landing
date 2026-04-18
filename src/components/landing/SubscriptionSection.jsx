import { useTranslation } from '../../lib/i18n';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap } from 'lucide-react';

export default function SubscriptionSection() {
  const { t } = useTranslation();

  const features = [1, 2, 3, 4, 5].map((i) => t(`subscriptionFeature${i}`));

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">{t('subscriptionTitle')}</h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-lg mx-auto"
      >
        <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-8 sm:p-10 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative space-y-8">
            {/* Badge */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Merchant Pro</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm text-muted-foreground">CHF</span>
                <span className="text-6xl font-black text-foreground tracking-tight">{t('subscriptionPrice')}</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{t('subscriptionCurrency')}</p>
            </div>

            {/* Description */}
            <p className="text-center text-muted-foreground text-sm leading-relaxed">
              {t('subscriptionDesc')}
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-stem/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-stem" />
                  </div>
                  <span className="text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/merchant"
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('getStarted')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}