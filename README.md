## What is differential serving?

At it's most basic level it looks something like you see below. The idea is that we serve code to specific environments. In this case we are interested in serving ESNext code to modern browsers that support it and serve ES5 code to browsers like IE. 

![diff-serving](./assets/diff-serving.gif)

The above is made possible thanks to `<script type="module">` and `<script nomodule>`. We can leverage these script properties to serve the correct JS when called by the browser.

## How to create two bundles?

### Webpack

### Webpack with HTML Plugin

## How to serve two bundles?

### Browser

### User Agent

## Issues

## Resources

Links:

-   https://philipwalton.com/articles/deploying-es2015-code-in-production-today/
-   https://www.npmjs.com/package/html-webpack-multi-build-plugin
-   https://www.npmjs.com/package/webpack-manifest-plugin
-   https://calendar.perfplanet.com/2018/doing-differential-serving-in-2019/

Issues:

-   https://github.com/philipwalton/webpack-esnext-boilerplate/issues/1
