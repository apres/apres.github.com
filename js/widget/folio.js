//# Folio Widget 
// Manages a sequence of elements that can be displayed individually, 
// or in paged sets.
//
// by Casey Duncan
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(['jquery'], function($) {
  //## Widget Constructor
  var FolioWidget = function(elem, params) {
    var currentPage,
        titleAttrName = 'data-page-title',
        folio = this;
    this.$el = elem;

    // Trigger an event for both the folio and pager
    var triggerEvent = function(eventName, page) {
      var target = page || folio;
      if (folio.pagerWidget) folio.pagerWidget.$el.trigger('pager-' + eventName);
      target.$el.trigger('folio-' + eventName, folio);
    }

    //## Scan For Page Elements
    //
    // Search the widget element for children with class "page".  These
    // elements are collected to make the folio pages.  This method resets any
    // existing pages. If pages are found the current page is set to the first
    // page. The current page is returned.
    this.findPages = function() {
      folio.pages = [];
      // Only direct children of the folio widget are considered
      // This prevents strange nesting of pages
      var pageElems = this.$el.find('>.page');
      if (pageElems) $.each(pageElems, function(i, elem) {
        elem = $(elem);
        folio.pages.push({
          index: i,
          $el: elem,
          title: elem.attr(titleAttrName) || 'Page ' + (i + 1),
        });
      });
      triggerEvent('pagesChanged');
      if (folio.pages.length) {
        return folio.currentPage(0);
      }
    }

    //## Get or Set the Current Page
    // PagerDelegate protocol method
    //
    // If called with no argument, return the current page object, which
    // has the attributes *index*, *elem*, and *title*. Note the current
    // page may be undefined if the widget contains no pages.
    //
    // If called with an integer index, or page title, the current page
    // is set to the matching page. In the case of duplicate titles,
    // the first matching page is selected. If no page matches, the
    // current page is unchanged.
    //
    // Return the current page.
    this.currentPage = function(whichPage) {
      var page;
      // `currentPage()` *(getter)*
      if (typeof whichPage === 'undefined') {
        return currentPage;
      // `currentPage('title')` *(setter)*
      } else if (typeof whichPage === 'string') {
        for (var i = 0; (page = this.pages[i]); i++) {
          if (whichPage === page.title) break;
        }
      // `currentPage(#)` *(setter)*
      } else if (typeof whichPage === 'number') {
        page = this.pages[whichPage];
      }
      if (page) {
        if (currentPage) {
          currentPage.$el.removeClass('current');
        }
        currentPage = page;
        page.$el.addClass('current');
        triggerEvent('currentPage', currentPage);
      }
      return currentPage;
    }

    //## Return a Page Object for an Index
    // PagerDelegate protocol method
    this.page = function(index) {
      return this.pages[index];
    }

    //## Return the Page Count
    // PagerDelegate protocol method
    this.pageCount = function() {
      return this.pages && this.pages.length || 0;
    }

    //## Add a Page
    //
    // **elem** The element containing the page content. 
    // This can be specified as a DOM element, or selector string.
    // This element should generally be a child of the widget element.
    //
    // **title** The page title. If not specified it will be derived from
    // the element attr `data-page-title`.
    //
    // **index** The index where the page will be inserted. If omitted,
    // the page is appended to the end of the list.
    //
    // Return the page object.
    this.addPage = function(elem, title, index) {
      elem = $(elem);
      if (title == null) var title = elem.attr(titleAttrName);
      var page = {$el: elem, title: title, index: index};
      if (typeof index === 'undefined') {
        var length = this.pages.push(page);
        page.index = length - 1;
      } else {
        var before = this.pages.slice(0, index);
        var after = this.pages.slice(index);
        var pages = before.concat([page], after);
        $.each(pages, function(i, p) {
          p.index = i;
        });
        this.pages = pages;
      }
      triggerEvent('pagesChanged');
      return page;
    }

    //## Remove a Page
    //
    // **index** The integer page index to remove from the folio. If this is
    // the current page, the current page will be changed to an adjacent page
    // if possible.
    //
    // Return `true` if a page was removed.
    this.removePage = function(index) {
      var newCurrentPage,
          page = this.pages[index],
          removed = false,
          pages = [];
      $.each(this.pages, function(oldIndex, oldPage) {
        if (oldPage && oldPage !== page) {
          oldPage.index = pages.length;
          pages.push(oldPage);
        } else {
          removed = true;
        }
        if (currentPage && page === oldPage && page === currentPage) {
          if (pages.length) {
            newCurrentPage = pages[pages.length - 1];
          } else {
            newCurrentPage = folio.pages[oldIndex + 1];
          }
        }
      });
      if (removed) {
        this.pages = pages;
        triggerEvent('pagesChanged');
        if (newCurrentPage) this.currentPage(newCurrentPage.index);
        if (pages.length === 0) {
          if (currentPage) currentPage.$el.removeClass('folio-current-page');
          currentPage = undefined;
          triggerEvent('currentPage');
        }
      }
      return removed;
    }

    this.findPages();

    if (params && params.pager) {
      params.pager.delegate(folio);
      folio.pagerWidget = params.pager;
    }
  }
  FolioWidget.widgetParams = {
    'pager': {type: 'widget', 
      descr: 'Optional reference to a pager widget to control the folio'},
  }
  return FolioWidget;
});
