import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toList } from '../../utils/apiClient';
import { formatDate } from '../../utils/format';
import { promoApi } from '../../utils/storeApi';

export function CampaignBanner() {
  const { data } = useApi(() => promoApi.campaigns(), []);
  const campaign = toList(data).find((c) => c.is_live ?? c.is_active);
  if (!campaign) return null;

  const discount = parseFloat(campaign.discount_percentage);

  return (
    <section aria-label="Current promotion" className="bg-lime text-night">
      <div className="mx-auto flex max-w-site flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:px-10">
        {!Number.isNaN(discount) && discount > 0 &&
        <p className="display shrink-0 text-[64px] md:text-[80px]">{Math.round(discount)}% off</p>
        }
        <div className="flex-1 md:border-l md:border-night/20 md:pl-8">
          <h2 className="text-2xl font-semibold">{campaign.title}</h2>
          <p className="mt-1.5 max-w-xl text-[15px] text-night/80">{campaign.description}</p>
          <p className="mt-2 text-sm text-night/70">Ends {formatDate(campaign.end_date)}</p>
        </div>
        <Link to="/shop" className="btn-primary focus-ring shrink-0 bg-night text-snow">
          Shop the offer <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>);

}