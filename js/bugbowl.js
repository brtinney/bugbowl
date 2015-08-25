$(function() {
	var question_index = (localStorage.question_index) ? Number(localStorage.question_index) - 1 : -1;
	var square = (localStorage.square) ? $('#'+localStorage.square) : null;
	var hidden_squares = (localStorage.hidden_squares) ? JSON.parse(localStorage.hidden_squares) : [];
	var mode = (localStorage.mode) ? localStorage.mode : 'rebus_reveal';
	var section = (localStorage.section) ? Number(localStorage.section) - 1 : -1;
	var sections = ['splash','intro','rebus_rules',
					'rebus_reveal-1','rebus_reveal-2','audience','rebus_reveal-3',
					'transition','point_rules','point_value-1','point_value-2','point_value-3',
					'final_transition','final_rules','final'];

	$('.square').on('click', function() {
		square = $(this);
		question_index++;

		localStorage.square = square.attr('id');
		localStorage.question_index = question_index;

		$('.square').addClass('question-opened');
		$('#question-view').fadeIn(200);
		$('#question-text').text(questions[mode][question_index].question);
		$('#question-answer').text(questions[mode][question_index].answer);
	});

	$('#question-correct').on('click', function() {
		$('#question-view').fadeOut(200);
		square.addClass('question-answered');
		hidden_squares.push(square.attr('id'));
		localStorage.hidden_squares = JSON.stringify(hidden_squares);
		square = null;
		localStorage.square = '';
	});

	$('#question-wrong').on('click', function() {
		$('#question-view').fadeOut(200);
		square = null;
		localStorage.square = '';
	});

	$(window).on('keyup', function(e) {
		if($('#question-view').css('display') != 'none') {
			if (e.which == 13) $('#question-correct').click();
		    if (e.which == 27) $('#question-wrong').click();
		}
	});

	$('#next-section').on('click', function() {
		if(section >= 0) {
			if(sections[section].indexOf('-') < 0) {
				$('#'+sections[section]).fadeOut(1000);
			}
			else {
				// Special logic for game boards
				$('#board table').fadeOut(1000);
				$('.square').removeClass('question-answered');
				hidden_squares = [];
				localStorage.hidden_squares = JSON.stringify(hidden_squares);
			}
		}
		section++;
		localStorage.section = section;

		if(sections[section].indexOf('-') < 0) {
			$('#'+sections[section]).delay(1000).fadeIn(1000);
		}
		else {
			$('#board table').delay(1000).fadeIn(1000, function() {
				$('#'+hidden_squares.join(',#')).addClass('question-answered');
				if(square) {
					// This is in case of restoring state
					square.click();
				}
			});
		}
	});

	$('#next-section').click();
});