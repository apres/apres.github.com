//# Pager Control Widget
//
// by Casey Duncan
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(['jquery'], function($) {
  //## Basic Pager Delegate
  var BasicPagerDelegate = function(elem, pages, current) {
    this.pages = pages;
    this.current = current;
    this.$el = elem;
    var self = this;
    setTimeout(function() {self.$el.trigger('pagerCurrentPage', self)}, 0);
  }
  BasicPagerDelegate.prototype.currentPage = function(index) {
    if (typeof index !== 'undefined' && index !== this.current 
        && index >= 0 && index < this.pages) {
      this.current = index;
      this.$el.trigger('pagerCurrentPage', this);
    }
    return {index: this.current};
  }
  BasicPagerDelegate.prototype.page = function(index) {
    if (index >= 0 && index < this.pages) {
      return {'index': index};
    }
  }
  BasicPagerDelegate.prototype.pageCount = function() {
    return this.pages;
  }

  //## Widget Constructor
  var PagerWidget = function(elem, params) {
    this.$el = elem;
    if (params && params.pages) {
      this.delegate(new BasicPagerDelegate(elem, params.pages, params.current));
    }
  }
  //## Get or Set the Pager Delegate
  // The pager delegate contains the elements being paged, stores the
  // page state, and provides methods for changing the current page. It
  // also handles changing the view as needed to display the current page.
  // A *folio* widget is a typical pager delegate.
  //
  // The pager delegate protocol has the following mandatory methods:
  //
  // `currentPage(index)` -- Get the current page object (with no args)
  // or set the current page index with an integer arg and return the
  // resulting page object.
  //
  // `page(index) -- Return the page object for the given index. Return
  // undefined if the index is out of bounds.
  //
  // `pageCount()` -- Return the number of pages.
  //
  // Pager delegates can also implement the following optional methods:
  //
  // `maxPage()` -- Return the maximum page index that can be currently
  // advanced to. If not implemented, this is assumed to be `pageCount() - 1`
  //
  // `minPage()` -- Return the minimum page index available. If not
  // implemented this is assumed to be `0`.
  //
  // Page objects must contain the property `index`. Optionally they can
  // have a `title` property, or others as required by the pager skin.
  PagerWidget.prototype.delegate = function(delegate) {
    if (typeof delegate === 'undefined') {
      return this._delegate;
    } else {
      this._delegate = delegate;
      this.$el.trigger('pagerDelegate', this);
    }
  }
  PagerWidget.prototype.BasicPagerDelegate = BasicPagerDelegate;
  PagerWidget.widgetParams = [
    {pages: {type: 'int', descr: 'If used standalone, specifies the number of pages. ' 
      + 'This value is ignored if a delegate widget is specified.'}},
    {current: {type: 'int', default: 0, descr: 'Used to specify the current page index '
      + 'when *pages* is also specified.'}},
  ];
  return PagerWidget;
});

