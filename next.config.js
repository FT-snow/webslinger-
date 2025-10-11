/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
        config.module.rules.push({
          test: /\.ts$/,
          exclude: [
            /node_modules/,
            /AppData/,
            /Microsoft/,
            /Office/,
            /SolutionPackages/,
            /OfflineFiles/,
            /.*AppData.*/,
            /.*Microsoft.*/,
            /.*Office.*/,
            /.*SolutionPackages.*/,
            /.*OfflineFiles.*/
          ]
        });
    
    return config;
  },
}

module.exports = nextConfig
