//# Run Apres test suite

require(
  ['jquery', 
   './apres-test.js', 
   './template-widget-test.js',
   './folio-test.js',
   './pager-test.js',
  ], 
  function($) {
    mocha.setup({
      ui: 'qunit',
      // Acceptable globals
      globals: ['XMLHttpRequest', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval']
    });
    $(document).ready(mocha.run);
  }
);
