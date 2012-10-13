(function ($) {
Drupal.behaviors.solr_ajax = {
  'attach': function(context, settings) {
    $('ol.solr_ajax-results').html('<div>Searching ...</div>');
    solrUrl = Drupal.settings.solr_ajax.solr_url;

    var uri = new Uri(document.URL);
    searchTerm = unescape(uri.path().split('/').slice(-1)[0]);
    pageNum = Number(uri.getQueryParamValue('page'));
    if (!pageNum) {
      pageNum = 0;
    }
    var params =  {
      defType: 'dismax',
      hl: 'true',
      'hl.fl': 'content',
      q: searchTerm, 
      spellcheck: "true", 
      fl: 'id,entity_id,entity_type,bundle,bundle_name,label,is_comment_count,ds_created,ds_changed,score,path,url,is_uid,tos_name,content', 
      rows: Drupal.settings.solr_ajax.rows, 
      start: (pageNum) * Drupal.settings.solr_ajax.rows, 
      qf: 'content^40 label^5.0 tos_name^3.0'
    };
    $.getJSON(solrUrl + '/select?wt=json&json.wrf=?', params, function(json) {
      if (json.response.numFound == 0) {
        $('ol.solr_ajax-results').html('No results containing all your search terms were found.');
        return
      }
      console.log(json);
      var output = '';
      for (var i = 0; i < json.response.docs.length; i++) {
        var date = new Date(json.response.docs[i].ds_created);
        //console.log(date);
        if (json.highlighting[json.response.docs[i].id].content) {
          var snip = json.highlighting[json.response.docs[i].id].content;
        }
        else {
          snip = '...';
        }
        output = output + '<li class="search-result"><h3 class="title"><a href="' + json.response.docs[i].url + '">' + json.response.docs[i].label + '</a></h3><div class="search-snippet-info">' + snip + '</div>' + date + '</li>';
      }

      $('ol.solr_ajax-results').html(output);
      pages = Math.floor(Number(json.response.numFound) / Number(Drupal.settings.solr_ajax.rows)) - 1;
      if (pages > 0) {
        if (json.response.start == "0") {
          pager = '<div class="item-list"><ul class="pager"><li class="pager-next"><a title="Go to next page" href="?page=' + (1+pageNum) +'">next ›</a></li><li class="pager-last last"><a title="Go to last page" href="?page=' + pages + '">last »</a></li></ul></div>';
        }
        else {
          pager = '<div class="item-list"><ul class="pager"><li class="pager-first first"><a title="Go to first page" href="' + uri.path() + '">« first</a></li><li class="pager-previous"><a title="Go to previous page" href="?page=' + (pageNum-1) + '">‹ previous</a></li><li class="pager-next"><a title="Go to next page" href="?page=' + (1+pageNum) +'">next ›</a></li><li class="pager-last last"><a title="Go to last page" href="?page=' + pages + '">last »</a></li></ul></div>';

        }
        $('ol.solr_ajax-results').after(pager);
      }
    });
  }
};
})(jQuery);
