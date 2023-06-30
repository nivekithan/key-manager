// @ts-check
// TODO whole things
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Key Manager",
  tagline: "Manage your API Keys",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://key-manager.nivekithan.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        blog: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "Key Manager",
        logo: {
          alt: "key Manager Logo",
          src: "img/logo.svg",
          href: "/intro",
        },
        items: [
          {
            href: "https://github.com/nivekithan/key-manager",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://key-manager.nivekithan.com",
            label: "Key Manager",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        copyright: `Made for Hashnode & 1Password hackathon by Nivekithan S`,
        links: [
          {
            label: "Github Profile",
            href: "https://github.com/nivekithan",
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  // plugins: [
  //   [
  //     "@docusaurus/plugin-client-redirects",
  //     { redirects: [{ to: "/docs/intro", from: ["/", "/docs"] }] },
  //   ],
  // ],
};

module.exports = config;
