/*
  dynasize
 @name      jquery.dynasize.js
 @author    FrankieKP
 @version   0.0.3
 @date      2015-10-17
 @copyright (c) 2015 FrankieKP
 @license   MIT License
*/
$.fn.dynasize = function() {

  var _MAX = 500;   // Max font size to render
  var _MIN = 1;     // Min font size to render
  var bins = {};    // For common buckets

  // Optimistically size the elements
  var ret = this.each(function() {
    var el = $(this).children("span");
    var elDisplay = el.css('display'); // Capture existing display type
    el.css('display', 'none'); // Get bounding box without element
    var h = ~~$(this).height();
    var w = ~~$(this).width();

    el.css('display', 'block');

    // Binary search for max size
    for (var low = _MIN, high = _MAX, rounds = 0; low != high && rounds < 50; rounds++) {
      var mid = ~~((high+low)/2);
      el.css('font-size', mid);
      //console.log(high, low, rounds, mid, el.height(), h)
      if (~~el.height() > h || ~~el.width() > w) high = mid;
      else if (~~el.height() < h || ~~el.width() < w) low = mid + 1;
      else break;
    }

    el.css('display', elDisplay);

    // Allow
    if ($(this).data('sizefactor')) {
      //console.log(mid)
      mid = ~~(mid * $(this).data('sizefactor'));
      //console.log(mid)
      el.css('font-size', mid);
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
