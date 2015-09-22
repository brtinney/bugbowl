var server = 1;
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
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify({'type': 'square',
			 											 'id': $(this).attr('id')});
		}
		square = $(this);
		question_index++;

		if(server)
		{
			localStorage.square = square.attr('id');
			localStorage.question_index = question_index;
		}

		$('.square').addClass('question-opened');
		$('#question-view').fadeIn(200);
		$('#question-text').text(questions[mode][question_index].question);
		$('#question-answer').text(questions[mode][question_index].answer);
	});

	$('#question-correct').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify({'type': 'question-correct'});
		}

		$('#question-view').fadeOut(200);
		square.addClass('question-answered');
		hidden_squares.push(square.attr('id'));
		if(server)
		{
			localStorage.hidden_squares = JSON.stringify(hidden_squares);
		}
		square = null;
		if(server)
		{
			localStorage.square = '';
		}
	});

	$('#question-wrong').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify({'type': 'question-wrong'});
		}

		$('#question-view').fadeOut(200);
		square = null;
		if(server)
		{
			localStorage.square = '';
		}
	});

	$(window).on('keyup', function(e) {
		if($('#question-view').css('display') != 'none') {
			if (e.which == 13) $('#question-correct').click();
		    if (e.which == 27) $('#question-wrong').click();
		}
	});

	$('#next-section').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify({'type': 'next-section'});
		}

		if(section >= 0) {
			if(sections[section].indexOf('-') < 0) {
				$('#'+sections[section]).fadeOut(100);
			}
			else {
				var saved_section = section;
				// Special logic for game boards
				$('#board table').fadeOut(100, function() {
					$('.square').removeClass('question-answered');
					hidden_squares = [];
					if(server)
					{
						localStorage.hidden_squares = JSON.stringify(hidden_squares);
					}
					if(mode == 'rebus_reveal' && sections[saved_section].split('-').pop() == '3') {
						mode = 'point_value';
						if(server)
						{
							localStorage.mode = mode;
						}
						$('#board tr:nth-child(1) td').text('100');
						$('#board tr:nth-child(2) td').text('200');
						$('#board tr:nth-child(3) td').text('300');
						$('#board tr:nth-child(4) td').text('500');
					}
					else if(mode == 'point_value' && sections[saved_section].split('-').pop() == '3') {
						mode = 'rebus_reveal';
						if(server)
						{
							localStorage.mode = mode;
						}
						$('.square').each(function(index) {
							$(this).text(index);
						});
					}
				});
			}
		}
		section++;
		if(server)
		{
			localStorage.section = section;
		}

		if(section >= sections.length) {
			resetStorage();
			$('#next-section').hide();
			return;
		}

		if(sections[section].indexOf('-') < 0) {
			$('#'+sections[section]).delay(100).fadeIn(100);
		}
		else {
			if(mode == "point_value") {
				$('#board tr:nth-child(1) td').text('100');
				$('#board tr:nth-child(2) td').text('200');
				$('#board tr:nth-child(3) td').text('300');
				$('#board tr:nth-child(4) td').text('500');
			}
			else {
				$('.square').each(function(index) {
					$(this).text(index);
				});
			}
			$('#board table').delay(100).fadeIn(100, function() {
				$('#'+hidden_squares.join(',#')).addClass('question-answered');
				if(square) {
					// This is in case of restoring state
					square.click();
				}
			});
		}
	});

	$('#reset-game').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify({'type': 'reset-game'});
		}
		resetStorage();
		location.reload();
	});

	if(server)
	{
		$('#next-section').click();
	}
});

function resetStorage() {
	if(server)
	{
		localStorage.removeItem('question_index');
		localStorage.removeItem('square');
		localStorage.removeItem('hidden_squares');
		localStorage.removeItem('mode');
		localStorage.removeItem('section');
	}
}
