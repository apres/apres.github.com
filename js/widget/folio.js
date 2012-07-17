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
    var currentPage;
    this.$el = elem;
    var titleAttrName = 'data-page-title';

    //## Scan For Page Elements
    //
    // Search the widget element for children with class "page".  These
    // elements are collected to make the folio pages.  This method resets any
    // existing pages. If pages are found the current page is set to the first
    // page. The current page is returned.
    this.findPages = function() {
      var folio = this;
      folio.pages = [];
      // Only direct children of the folio widget are considered
      // This prevents strange nesting of pages
      var pageElems = this.$el.find('>.page');
      if (pageElems) $.each(pageElems, function(i, elem) {
        folio.pages.push({
          index: i,
          elem: elem,
          title: elem.attr(titleAttrName) || 'Page ' + (i + 1),
        });
      });
      if (folio.pages.length) {
        return folio.currentPage(0);
      }
    }

    //## Get or Set the Current Page
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
          currentPage.elem.removeClass('folio-current-page');
        }
        currentPage = page;
        page.elem.addClass('folio-current-page');
        page.elem.trigger('folioCurrentPage', this);
      }
      return currentPage;
    }

    //## Go To Next Page
    //
    // Set the current page to the next page in sequence.
    // Return the current page object.
    this.nextPage = function() {
      if (currentPage) return this.currentPage(currentPage.index + 1);
    }

    //## Go To Previous Page
    //
    // Set the current page to the previous page in sequence.
    // Return the current page object.
    this.previousPage = function() {
      if (currentPage) return this.currentPage(currentPage.index - 1);
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
      var page = {elem: elem, title: title, index: index};
      var length = this.pages.push(page);
      if (typeof index === 'undefined') {
        page.index = length - 1;
      } else {
        this.pages.sort(function(a, b) {
          return a.index - b.index;
        });
      }
      elem.trigger('folioPagesChanged', this);
      return page;
    }

    //## Remove a Page
    //
    // **page** The page object, or integer page index to remove from the
    // folio. If this is the current page, the current page will be changed
    // to an adjacent page if possible.
    this.removePage = function(page) {
      var index, newCurrentPage;
      if (typeof page === 'number') {
        index = page;
        page = this.pages[index];
      } else {
        for (index = 0; index < this.pages.length; index++) {
          if (page === this.pages[index]) {
            break;
          }
        }
      }
      if (page === this.pages[index]) {
        var pages = [];
        $.each(this.pages, function(oldIndex, oldPage) {
          if (oldPage && oldPage !== page) {
            oldPage.index = pages.length;
            pages.push(oldPage);
          } else if (currentPage && page === currentPage) {
            if (pages.length) {
              newCurrentPage = pages[pages.length - 1];
            } else {
              newCurrentPage = this.pages[oldIndex + 1];
            }
          }
        });
        this.pages = pages;
        this.$el.trigger('folioPagesChanged', this);
        if (page === currentPage) {
          this.currentPage(newCurrentPage.index);
        }
      }
    }
    this.findPages();
  }
  return FolioWidget;
});
