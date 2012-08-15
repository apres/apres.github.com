requirejs(
  ['apres', 'chai', 'sinon', 'jquery', 'apres-testing', 'widget/folio'], 
  function(apres, chai, sinon, $, testing, FolioWidget) {
    var assert = chai.assert;

    suite('folio widget');
    testing.testWidgetModule('widget/folio');
    testing.testWidgetElem('widget/folio');

    var elemWithPages = function() {
      var title;
      var elem = $('<div></div>');
      elem.trigger = sinon.spy();
      var pageElems = [];
      for (var i = 0; (title = arguments[i]); i++) {
        var page = $('<div class="page" data-page-title="' + title + '"></div>')
        pageElems.push(page);
        elem.append(page);
      }
      elem.find = function() {
        return pageElems;
      };
      return elem;
    }

    testing.test('#find pages on init', function() {
      var elem = elemWithPages('First Page', 'Second Page');
      var pageElems = elem.find();
      var folio = new FolioWidget(elem);
      assert.equal(folio.pageCount(), 2);
      assert.strictEqual(folio.pages[0].$el.html(), pageElems[0].html());
      assert.strictEqual(folio.pages[0].index, 0);
      assert.strictEqual(folio.pages[0].title, 'First Page');
      assert.strictEqual(folio.pages[1].$el.html(), pageElems[1].html());
      assert.strictEqual(folio.pages[1].index, 1);
      assert.strictEqual(folio.pages[1].title, 'Second Page');
    });

    testing.test('#current page on init', function() {
      var elem = elemWithPages('Page Uno', 'Page Dos', 'Page Tres');
      var pageElems = elem.find();
      var folio = new FolioWidget(elem);
      var page = folio.currentPage();
      assert.strictEqual(page.$el.html(), pageElems[0].html());
      assert.strictEqual(page.title, 'Page Uno');
      assert.strictEqual(page.index, 0);
    });

    testing.test('#no pages on init', function() {
      var elem = elemWithPages();
      var folio = new FolioWidget(elem);
      assert.equal(folio.pages.length, 0);
      assert.isUndefined(folio.currentPage());
    });

    testing.test('#current page by index', function() {
      var elem = elemWithPages('Page Uno', 'Page Dos', 'Page Tres');
      var pageElems = elem.find();
      var folio = new FolioWidget(elem);
      var page = folio.currentPage(1);
      assert.strictEqual(page.$el.html(), pageElems[1].html());
      assert.strictEqual(page, folio.currentPage());
      var page = folio.currentPage(2);
      assert.strictEqual(page.$el.html(), pageElems[2].html());
      assert.strictEqual(page, folio.currentPage());
      var page = folio.currentPage(0);
      assert.strictEqual(page.$el.html(), pageElems[0].html());
      assert.strictEqual(page, folio.currentPage());
    });

    testing.test('#current page by title', function() {
      var elem = elemWithPages('Groucho', 'Zeppo', 'Chico', 'Zeppo');
      var pageElems = elem.find();
      var folio = new FolioWidget(elem);
      var page = folio.currentPage('Chico');
      assert.strictEqual(page.$el.html(), pageElems[2].html());
      assert.strictEqual(page, folio.currentPage());
      var page = folio.currentPage('Groucho');
      assert.strictEqual(page.$el.html(), pageElems[0].html());
      assert.strictEqual(page, folio.currentPage());
      var page = folio.currentPage('Zeppo');
      assert.strictEqual(page.$el.html(), pageElems[1].html());
      assert.strictEqual(page, folio.currentPage());
      var page = folio.currentPage('Moe');
      assert.strictEqual(page.$el.html(), pageElems[1].html());
      assert.strictEqual(page, folio.currentPage());
      var page = folio.currentPage('Larry');
      assert.strictEqual(page.$el.html(), pageElems[1].html());
      assert.strictEqual(page, folio.currentPage());
    });

    testing.test('#current page class', function() {
      var elem = elemWithPages('Page Uno', 'Page Dos', 'Page Tres');
      var folio = new FolioWidget(elem);
      var page = folio.currentPage(1);
      assert.strictEqual(page.$el.attr('class'), 'page current');
      var page = folio.currentPage(2);
      assert.strictEqual(page.$el.attr('class'), 'page current');
      var page = folio.currentPage(0);
      assert.strictEqual(page.$el.attr('class'), 'page current');
    });

    testing.asyncTest('#current page event', function(sandbox, done) {
      var elem = elemWithPages('Page Uno', 'Page Dos', 'Page Tres');
      var pageElems = elem.find();
      var folio = new FolioWidget(elem);
      elem.on('folio-currentPage', function(evt, widget) {
        assert.strictEqual(widget, folio);
        done();
      });
      var page = folio.currentPage(1);
    });

    testing.test('#add page append', function() {
      var elem = elemWithPages();
      var folio = new FolioWidget(elem);
      assert.equal(folio.pages.length, 0);
      var pageElem = testing.BasicElem();
      var page = folio.addPage(pageElem, 'Foo');
      assert.equal(folio.pages.length, 1);
      assert.deepEqual(page.$el, $(pageElem));
      assert.strictEqual(page.index, 0);
      assert.strictEqual(page.title, 'Foo');
      assert.strictEqual(page, folio.pages[page.index]);
      var page = folio.addPage(pageElem, 'Bar');
      assert.equal(folio.pages.length, 2);
      assert.deepEqual(page.$el, $(pageElem));
      assert.strictEqual(page.index, 1);
      assert.strictEqual(page.title, 'Bar');
      assert.strictEqual(page, folio.pages[page.index]);
    });

    testing.test('#add page with attr title', function() {
      var elem = elemWithPages();
      var folio = new FolioWidget(elem);
      assert.equal(folio.pages.length, 0);
      var pageElem = testing.AttrElem({'data-page-title': 'Zappa'});
      var page = folio.addPage(pageElem);
      assert.equal(folio.pages.length, 1);
      assert.deepEqual(page.$el, $(pageElem));
      assert.strictEqual(page.title, 'Zappa');
    });

    var assertPages = function(folio, expectedTitles) {
      var titles = [];
      var page;
      for (var i = 0; (page = folio.pages[i]); i++) {
        titles.push(page.title);
      }
      assert.deepEqual(titles, expectedTitles);
    }

    testing.test('#add page insert', function() {
      var elem = elemWithPages('Orange', 'Yellow', 'Green', 'Violet');
      var folio = new FolioWidget(elem);
      assert.equal(folio.pages.length, 4);
      var pageElem = testing.BasicElem();
      var page = folio.addPage(pageElem, 'Blue', 3);
      assert.equal(folio.pages.length, 5);
      assert.deepEqual(page.$el, $(pageElem));
      assert.strictEqual(page.title, 'Blue');
      assert.strictEqual(page.index, 3);
      assert.strictEqual(page, folio.pages[3]);
      var page = folio.addPage(pageElem, 'Red', 0);
      assert.equal(folio.pages.length, 6);
      assert.deepEqual(page.$el, $(pageElem));
      assert.strictEqual(page.title, 'Red');
      assert.strictEqual(page.index, 0);
      assert.strictEqual(page, folio.pages[0]);
      assertPages(folio, ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet']);
    });

    testing.test('#add page triggers changed event', function() {
      var elem = elemWithPages();
      var folio = new FolioWidget(elem);
      var trigger = folio.$el.trigger = sinon.spy();
      var page = folio.addPage(testing.BasicElem(), 'foobar');
      assert(trigger.calledWith('folio-pagesChanged'), 'pagesChanged not fired');
    });

    testing.test('#remove page by index', function() {
      var elem = elemWithPages('do', 're', 'mi', 'fa', 'so', 'la', 'ti');
      var folio = new FolioWidget(elem);
      assert.equal(folio.pages.length, 7);
      var removed = folio.removePage(2);
      assert(removed, 'removePage() returned false');
      assertPages(folio, ['do', 're', 'fa', 'so', 'la', 'ti']);
      var removed = folio.removePage(2);
      assert(removed, 'removePage() returned false');
      assertPages(folio, ['do', 're', 'so', 'la', 'ti']);
      var removed = folio.removePage(0);
      assert(removed, 'removePage() returned false');
      assertPages(folio, ['re', 'so', 'la', 'ti']);
      var removed = folio.removePage(3);
      assert(removed, 'removePage() returned false');
      assertPages(folio, ['re', 'so', 'la']);
    });

    testing.test('#remove page invalid index', function() {
      var elem = elemWithPages('do', 're', 'mi');
      var folio = new FolioWidget(elem);
      assert.equal(folio.pages.length, 3);
      var removed = folio.removePage(5);
      assert(!removed, 'removePage() returned true');
      assertPages(folio, ['do', 're', 'mi']);
    });

    testing.test('#remove current page', function() {
      var elem = elemWithPages('do', 're', 'mi', 'fa');
      var folio = new FolioWidget(elem);
      assert.equal(folio.currentPage().index, 0);
      var removed = folio.removePage(0);
      assert(removed, 'removePage() returned false');
      assertPages(folio, ['re', 'mi', 'fa']);
      assert.equal(folio.currentPage().index, 0);
      assert.equal(folio.currentPage().title, 're');
      folio.currentPage(2);
      assert.equal(folio.currentPage().index, 2);
      var removed = folio.removePage(2);
      assert(removed, 'removePage() returned false');
      assertPages(folio, ['re', 'mi']);
      assert.equal(folio.currentPage().index, 1);
      assert.equal(folio.currentPage().title, 'mi');
    });

    testing.test('#remove last page', function() {
      var elem = elemWithPages('doh');
      var folio = new FolioWidget(elem);
      var lastPage = folio.currentPage();
      var trigger = folio.$el.trigger = sinon.spy();
      assert.equal(lastPage.index, 0);
      var removed = folio.removePage(0);
      assert(removed, 'removePage() returned false');
      assertPages(folio, []);
      assert.isUndefined(folio.currentPage());
      assert(trigger.calledWith('folio-currentPage'), 'currentPage not fired');
      assert(trigger.calledWith('folio-pagesChanged'), 'pagesChanged not fired');
    });

    testing.test('#remove page triggers changed event', function() {
      var elem = elemWithPages('Foo', 'Bar');
      var folio = new FolioWidget(elem);
      var trigger = folio.$el.trigger = sinon.spy();
      var removed = folio.removePage(1);
      assert(removed, 'removePage() returned false');
      assert(trigger.calledWith('folio-pagesChanged'), 'pagesChanged not fired');
    });


    testing.asyncTest('#pager', function(sandbox, done) {
      var elem = elemWithPages('Foo', 'Bar');
      var pagerElem = new testing.AttrElem;
      var pager = {
        '$el': elem,
        delegate: function(widget) {
          assert.instanceOf(widget, FolioWidget);
          done();
        }
      }
      new FolioWidget(elem, {pager: pager});
    });
  }
);
