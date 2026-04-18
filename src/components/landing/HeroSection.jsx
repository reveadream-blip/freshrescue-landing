import { useTranslation } from '../../lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ heroImage, marketBg }) {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={marketBg}
          alt="Market background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
      </div>

      {/* Animated pulse rings */}
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative w-96 h-96">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-ring" />
          <div className="absolute inset-8 rounded-full border border-primary/15 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-16 rounded-full border border-primary/10 animate-pulse-ring" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              <div className="w-2 h-2 rounded-full bg-stem animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">FreshRescue</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              {t('heroTitle')}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('exploreCta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/merchant"
                className="inline-flex items-center justify-center gap-2 bg-card border border-border hover:border-primary/50 text-foreground font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                {t('merchantCta')}
              </Link>
            </div>
          </motion.div>

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Fresh food"
                className="relative rounded-2xl shadow-2xl w-full"
              />
              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-xl p-4 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🔔</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Flash Deal!</p>
                    <p className="text-xs text-muted-foreground">Artisan bread — CHF 3.50 (was CHF 12)</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}