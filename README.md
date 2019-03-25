## What is differential serving?

At it's most basic level it looks something like you see below. The idea is that we serve code to specific environments. In this case we are interested in serving ES6 code to modern browsers that support it and serve ES5 code to browsers like IE. 

This is made possible thanks to `<script type="module">` and `<script nomodule>`. We can leverage these script properties to serve the correct JS when called by the browser.

![diff-serving](./assets/diff-serving.gif)

Code running above can be found in [examples/test](./examples/test/).

## How to create two bundles?

First, we need to create two bundles. One that targets ES5 environment (you probably already do this) and one that targets ES6 features. To do this we leverage the power of [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env.html) and webpack.

### webpack

Full Example: [webpack](./examples/webpack)

This is a snippet from the example showing two webpack configs that are being exported. One contains settings we want for ES5 (legacy) code and the other contains settings for modern ES6 code.

[**webpack.config.js**](./examples/webpack/webpack.config.js)
```js
module.exports = [
  {
    ...
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].legacy.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env',
                {
                    targets: {
                        browsers: [
                          /**
                           *  Browser List: https://bit.ly/2FvLWtW
                           *  `defaults` setting gives us IE11 and others at ~86% coverage
                           */
                          'defaults'
                        ]
                    },
                    useBuiltIns: 'usage',
                    modules: false,
                    corejs: 2
                }]
              ]
            }
          }
        }
      ]
    }
    ...
  },
  {
    ...
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].esm.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env',
                {
                    targets: {
                        browsers: [
                          /**
                           *  Browser List: https://bit.ly/2Yjs58M
                           */
                          'Edge >= 16',
                          'Firefox >= 60',
                          'Chrome >= 61',
                          'Safari >= 11',
                          'Opera >= 48'
                        ]
                    },
                    useBuiltIns: 'usage',
                    modules: false,
                    corejs: 2
                }]
              ]
            }
          }
        }
      ]
    },
    ...
  }
];
```

<!-- ### Webpack with HTML Plugin -->

## How to serve two bundles?

Now you need to decide how you want to serve the two different bundles. The most interesting way is letting the browser decide which bundle it should parse and execute. The other way is having the server decide based off of the user agent string that is making the request.

### Browser

Full Example: [webpack](./examples/webpack)

Here is a small example of what the browser implementation looks:

```html
<script nomodule src="/dist/index.legacy.js"></script>
<script type="module" src="/dist/index.esm.js"></script>
```

That's really all that's needed to get this to work. From there the browser can decide which script to load and execute. `<script type="module">` contains are ES6 code and `<script nomodule>` works for ES5 code. 

Unfortunately, this approach is not without its [issues](./#issues).

### User Agent

Full Example: [user-agent](./examples/user-agent)

The more manual approach is to detect the user agent string and dynamically serve the correct bundle. There is a great article written by [Shubham Kanodia](https://twitter.com/_pastelsky) on [Smashing Magazine](https://www.smashingmagazine.com/2018/10/smart-bundling-legacy-code-browsers/) that introduces a package called [`browserslist-useragent`](https://www.npmjs.com/package/browserslist-useragent). 

Using this we can create an express middleware to detect if we can use `<script type="module">` tag or not.

[**index.js**](./examples/user-agent/index.js)(server)
```js
const express = require('express');
const { matchesUA } = require('browserslist-useragent');
const exphbs  = require('express-handlebars');

...

app.use((req, res, next) => {
  try {
    const ESM_BROWSERS = [
      'Edge >= 16',
      'Firefox >= 60',
      'Chrome >= 61',
      'Safari >= 11',
      'Opera >= 48'
    ];
  
    const isModuleCompatible = matchesUA(req.headers['user-agent'], { browsers: ESM_BROWSERS, allowHigherVersions: true });
  
    res.locals.isModuleCompatible = isModuleCompatible;
  } catch (error) {
    console.error(error);
    res.locals.isModuleCompatible = false;
  }
  next();
});

app.get('/', (req, res) => {
  res.render('home', { isModuleCompatible: res.locals.isModuleCompatible });
});

...
```

Then within our template we can check to see if the browser works with ESM code, if so then we serve that bundle with the `<script type="module">` tag otherwise we fallback to a regular `<script>` tag.

[**main.hbs**](./examples/user-agent/views/main.hbs)
```hbs
{{#if isModuleCompatible}}
<script type="module" src="/static/index.esm.js"></script>
{{else}}
<script src="/static/index.legacy.js"></script>
{{/if}}
```

## Tests

With both methods in place, it's time to run some tests to see what each yields.

Goal: Serve ES6 bundle to ES6 supported environments and serve ES5 bundles to ES5 environments. Only one bundle is to be parsed and executed.

Browsers Tested:

- 🎉 = `<script type="module">` support landed
- ✅ = Works as expected (correct bundle is parsed and executed)
- ⁉️ = Has issues

| Browser          | Version | Browser Test Link                   | User Agent Test Link |
|------------------|---------|-------------------------------------|----------------------|
| Chrome           | 73      | [View](./tests/Chrome-73.gif)       | N/A                  |
| Chrome           | 61      | [View](./tests/Chrome-61.gif)       | N/A                  |
| Chrome           | 61      | [View](./tests/Chrome-60.gif)       | N/A                  |
| Safari           | 12      | [View](./tests/Safari-12.gif)       | N/A                  |
| Safari           | 11.1    | [View](./tests/Safari-11.gif)       | N/A                  |
| Safari           | 10.1    | [View](./tests/Safari-10-1.gif)     | N/A                  |
| Firefox          | 66      | [View](./tests/Firefox-66.gif)      | N/A                  |
| Firefox          | 60      | [View](./tests/Firefox-60.gif)      | N/A                  |
| Firefox          | 59      | [View](./tests/Firefox-59.gif)      | N/A                  |
| MSIE             | 11      | [View](./tests/MSIE-11.gif)         | N/A                  |
| MSEdge           | 18      | [View](./tests/MSEdge-18.gif)       | N/A                  |
| MSEdge           | 16      | [View](./tests/MSEdge-16.gif)       | N/A                  |
| MSEdge           | 15      | [View](./tests/MSEdge-15.gif)       | N/A                  |
| iPhone XS Safari | Latest  | [View](./tests/iPhoneXS-Safari.gif) | N/A                  |
| iPhone X Safari  | Latest  | [View](./tests/iPhoneX-Safari.gif)  | N/A                  |
| iPhone 8 Safari  | Latest  | [View](./tests/iPhone8-Safari.gif)  | N/A                  |
| Pixel 2 Chrome   | Latest  | [View](./tests/Pixel2-Chrome.gif)   | N/A                  |
| Galaxy S9 Chrome | Latest  | [View](./tests/GalaxyS9-Chrome.gif) | N/A                  |

## Performance

## Issues

## Resources

Links:

-   https://philipwalton.com/articles/deploying-es2015-code-in-production-today/
-   https://www.npmjs.com/package/html-webpack-multi-build-plugin
-   https://www.npmjs.com/package/webpack-manifest-plugin
-   https://calendar.perfplanet.com/2018/doing-differential-serving-in-2019/
-   https://www.smashingmagazine.com/2018/10/smart-bundling-legacy-code-browsers/

Issues:

-   https://github.com/philipwalton/webpack-esnext-boilerplate/issues/1
