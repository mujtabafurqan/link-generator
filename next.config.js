/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')(['@simplewebauthn/browser']); // pass the modules you would like to see transpiled

module.exports = withTM({
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, topLevelAwait: true };
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true 
    return config;
  },
});