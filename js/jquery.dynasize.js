$.fn.dynasize = function() {

  var _MAX = 500;   // Max font size to render
  var _MIN = 1;     // Min font size to render
  var bins = {};    // For common buckets

  // Optimistically size the elements
  var ret = this.each(function() {
      var h = $(this).height();
      var w = $(this).width();
      var el = $(this).children("span");

      // Binary search for max size
      for (var low = _MIN, high = _MAX, rounds = 0; low < high && rounds < 50; rounds++) {
        var mid = ~~((high+low)/2);
        el.css('font-size', mid);
        if (el.height() > h || el.width() > w) high = mid;
        else if (el.height() < h || el.width() < w) low = mid + 1;
        else break;
      }

      // Log computed size if part of a set
      var group = $(this).data('sizegroup');
      if (group) {
        if (bins[group]) bins[group].push(mid);
        else bins[group] = [mid];
      }
    });

    // Unify the sizes for grouped items
    $.each(bins, function(groupIdentifier, sizes){
      var min = Math.min.apply(Math, sizes);
      $("."+groupIdentifier).children("span").css("font-size", min);
    });

    return ret;
};
