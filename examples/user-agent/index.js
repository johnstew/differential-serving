const express = require('express');
const { matchesUA } = require('browserslist-useragent');
const exphbs  = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use('/static', express.static('dist'));

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

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));