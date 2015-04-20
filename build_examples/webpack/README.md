`browserify -x axios app.js > bundle.js` will produce `bundle.js`

Note the external dependency "axios" that is excluded from the build (it's not needed when using js-data-angular).
