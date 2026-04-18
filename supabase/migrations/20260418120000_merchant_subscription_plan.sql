-- Champs Stripe / type d'offre pour le webhook et l'UI commerçant.
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS subscription_plan text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

COMMENT ON COLUMN public.merchants.subscription_plan IS
  'recurring_monthly | one_month | yearly_onetime | yearly_subscription (libellé métier, renseigné par le webhook)';
COMMENT ON COLUMN public.merchants.stripe_subscription_id IS
  'Souscription Stripe si prélèvement récurrent (mensuel ou annuel récurrent); NULL pour paiement ponctuel 1 mois.';
COMMENT ON COLUMN public.merchants.stripe_customer_id IS 'Client Stripe (optionnel, pour le portail client).';
