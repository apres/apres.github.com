requirejs(
  ['apres', 'chai', 'sinon', 'jquery', 'apres-testing', 'widget/pager'], 
  function(apres, chai, sinon, $, testing, PagerWidget) {
    var assert = chai.assert;

    suite('pager widget');
    testing.testWidgetModule('widget/pager');
    testing.testWidgetElem('widget/pager');

    testing.test('#no delegate', function() {
      var pager = new PagerWidget(testing.BasicElem());
      assert.isUndefined(pager.delegate());
    });

    testing.test('#basic set delegate', function() {
      var pager = new PagerWidget(testing.BasicElem());
      var delegate = {};
      pager.delegate(delegate);
      assert.strictEqual(pager.delegate(), delegate);
    });

    testing.test('#basic delegate', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 5});
      assert.instanceOf(pager.delegate(), pager.BasicPagerDelegate);
    });

    testing.test('#basic delegate current', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 5, current:3});
      assert.equal(pager.delegate().currentPage().index, 3);
    });

    testing.test('#basic delegate set current', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 5});
      assert.equal(pager.delegate().currentPage(2).index, 2);
      assert.equal(pager.delegate().currentPage().index, 2);
      assert.equal(pager.delegate().currentPage(4).index, 4);
      assert.equal(pager.delegate().currentPage().index, 4);
    });

    testing.test('#basic delegate set current out of bounds', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 5, current:1});
      assert.equal(pager.delegate().currentPage(5).index, 1);
      assert.equal(pager.delegate().currentPage().index, 1);
      assert.equal(pager.delegate().currentPage(-1).index, 1);
      assert.equal(pager.delegate().currentPage().index, 1);
    });

    testing.test('#basic delegate page count', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 8});
      assert.equal(pager.delegate().pageCount(), 8);
      var pager = new PagerWidget(testing.BasicElem(), {pages: 2});
      assert.equal(pager.delegate().pageCount(), 2);
    });

    testing.test('#basic delegate page', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 3});
      assert.equal(pager.delegate().page(1).index, 1);
      assert.equal(pager.delegate().page(0).index, 0);
      assert.equal(pager.delegate().page(2).index, 2);
    });

    testing.test('#basic delegate page leaves current unchanged', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 3, current: 0});
      assert.equal(pager.delegate().currentPage().index, 0);
      pager.delegate().page(1);
      assert.equal(pager.delegate().currentPage().index, 0);
      pager.delegate().page(3);
      assert.equal(pager.delegate().currentPage().index, 0);
      pager.delegate().page(0);
      assert.equal(pager.delegate().currentPage().index, 0);
    });

    testing.test('#basic delegate page out of bounds', function() {
      var pager = new PagerWidget(testing.BasicElem(), {pages: 3});
      assert.isUndefined(pager.delegate().page(-100));
      assert.isUndefined(pager.delegate().page(-1));
      assert.isUndefined(pager.delegate().page(3));
      assert.isUndefined(pager.delegate().page(393));
    });

  }
);

