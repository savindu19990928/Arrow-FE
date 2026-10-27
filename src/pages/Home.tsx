import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeatureStrip } from '../components/home/FeatureStrip';
import { FeaturedBikes } from '../components/home/FeaturedBikes';
import { CampaignBanner } from '../components/home/CampaignBanner';
import { ThreeDShowcase } from '../components/home/ThreeDShowcase';
import { CategoryShowcase } from '../components/home/CategoryShowcase';

export function Home() {
  return (
    <>
      <HeroSection />
      <FeatureStrip />
      <FeaturedBikes />
      <CampaignBanner />
      <ThreeDShowcase />
      <CategoryShowcase />
    </>);

}