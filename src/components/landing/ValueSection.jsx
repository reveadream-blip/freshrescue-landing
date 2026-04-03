import { useTranslation } from '../../lib/i18n';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShieldCheck, Power, UserX, Percent, MapPin, Recycle } from 'lucide-react';

const merchantIcons = [TrendingUp, Users, ShieldCheck, Power];
const customerIcons = [UserX, Percent, MapPin, Recycle];

export default function ValueSection({ fruitImage, vegImage }) {
  const { t } = useTranslation();

  const merchantBenefits = [1, 2, 3, 4].map((i) => ({
    text: t(`merchantBenefit${i}`),
    icon: merchantIcons[i - 1],
  }));

  const customerBenefits = [1, 2, 3, 4].map((i) => ({
    text: t(`customerBenefit${i}`),
    icon: customerIcons[i - 1],
  }));

  return (
    <section className="py-24 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Merchants */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <img src={vegImage} alt="Fresh vegetables" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <h3 className="absolute bottom-6 left-6 text-2xl font-black">{t('forMerchants')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {merchantBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/30 hover:border-primary/30 transition-colors">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-snug">{b.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Customers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <img src={fruitImage} alt="Fresh fruit" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <h3 className="absolute bottom-6 left-6 text-2xl font-black">{t('forCustomers')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {customerBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/30 hover:border-accent/30 transition-colors">
                    <Icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-snug">{b.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}