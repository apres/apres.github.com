//# Pager Control Widget
//
// by Casey Duncan
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(['apres', 'jquery'], function(apres, $) {
  //## Basic Pager Delegate
  var BasicPagerDelegate = function(elem, pages, current) {
    this.pages = pages;
    this.$el = elem;
    this.currentPage(current);
  }
  BasicPagerDelegate.prototype.currentPage = function(index) {
    if (typeof index !== 'undefined' && index !== this.current 
        && index >= 0 && index < this.pages) {
      this.current = index;
      this.$el.trigger('pager-currentPage', this);
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
  PagerWidget.prototype.events = {
    'click .action-currentPage': function(evt) {
      var page = evt.target.getAttribute('data-page');
      if (page) {
        this.delegate().currentPage(Number(page));
        evt.preventDefault();
      }
    },
    'click .action-previousPage': function() {
      var delegate = this.delegate();
      var index = delegate.currentPage().index - 1;
      if (index >= 0) delegate.currentPage(index);
    },
    'click .action-nextPage': function() {
      var delegate = this.delegate();
      var index = delegate.currentPage().index + 1;
      if (index < delegate.pageCount()) delegate.currentPage(index);
    },
  };
  PagerWidget.prototype.BasicPagerDelegate = BasicPagerDelegate;
  PagerWidget.widgetParams = {
    pages: {type: 'int', descr: 'If used standalone, specifies the number of pages. ' 
      + 'This value is ignored if a delegate widget is specified.'},
    current: {type: 'int', default: 0, descr: 'Used to specify the current page index '
      + 'when *pages* is also specified.'},
  };

  //## Define built-in pager skins
  var skins = PagerWidget.skins = {};

/*
  skins.basic = function() {
    this.innerHtml = function(widget) {
      return brackets(
        ['a class="previousPage"', '◀'],
        brackets.repeat(widget.delegate().pageCount(), function(i) {
          return ['a class="currentPage"', {'data-page': i}, i + 1]
        }),
        ['a class="nextPage"', '▶']
      );
    }
  }
*/

  skins.basic = function(elem, widget) {
    var pageLimit = 4;
    var delegate = widget.delegate();
    this.layout = function() {
      var abs = Math.abs,
          pages = this.pageCount = delegate.pageCount(),
          current = this.pageIndex = delegate.currentPage().index,
          html = '<a class="action-nextPage" href="#">▶</a>';
      for (var i = pages - 1; i >= 0; i--) {
        html = '<a class="action-currentPage page' + i + '" href="#" data-page="' + i + '">' + (i+1) + '</a>' + html;
        if (i > pageLimit && (i <= current - 2 || i > current + 2)) {
          html = '<span class="action-currentPage">&hellip;</span>' + html;
          if (i > current) {
            i = Math.max(pageLimit + 1, current + 3);
          } else {
            i = 1;
          }
        }
      }
      html = '<a class="action-previousPage" href="#">◀</a>' + html;
      elem.html(html);
      elem.find('.page' + current).addClass('current');
    }
    this.update = function() {
      if (delegate.pageCount() > pageLimit) {
        this.layout();
      } else {
        var current = delegate.currentPage().index;
        elem.find('.action-currentPage.current').removeClass('current');
        elem.find('.action-currentPage.page' + current).addClass('current');
      }
    }
    this.events = {
      'pager-pageschanged': 'layout',
      'pager-currentPage': 'update',
    }
    apres.linkStyleSheet('/css/skin/pager.css');
    elem.addClass('pager-basic-skin');
  }
  return PagerWidget;
});
