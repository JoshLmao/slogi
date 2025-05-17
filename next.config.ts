import * as nextI18NextConfig from './next-i18next.config.js';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    i18n: (nextI18NextConfig as unknown as { i18n: NonNullable<NextConfig['i18n']> }).i18n,
    /* config options here */
};

export default nextConfig;
