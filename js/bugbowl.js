var server = 1;
$(function() {
	var questions_cache = (localStorage.questions_cache) ? JSON.parse(localStorage.questions_cache) : $.extend({}, questions);
	var round = (localStorage.round) ? Number(localStorage.round) : 0;
	var last_question = (localStorage.last_question) ? JSON.parse(localStorage.last_question) : '';
	var square = (localStorage.square) ? $('#'+localStorage.square) : '';
	var hidden_squares = (localStorage.hidden_squares) ? JSON.parse(localStorage.hidden_squares) : [];
	var mode = (localStorage.mode) ? localStorage.mode : 'rebus_reveal';
	var team = (localStorage.team) ? Number(localStorage.team) : 0;
	var scores = (localStorage.scores) ? JSON.parse(localStorage.scores) : [0,0,0];
	var section = (localStorage.section) ? Number(localStorage.section) - 1 : -1;
	var sections = ['splash','intro','rebus_rules',
					'rebus_reveal-1','rebus_reveal-2','audience','rebus_reveal-3',
					'transition','point_rules','point_value-1','point_value-2','point_value-3',
					'final_transition','final_rules','final'];

	$('.square').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify(JSON.parse(localStorage.bugbowl_event)
													   	    .concat({'type': 'square', 'id': $(this).attr('id')})
												   	   );
		}
		square = $(this);
		if(server)
		{
			localStorage.square = square.attr('id');
		}

		if(last_question == '')
		{
			if(mode == 'point_value')
			{
				$(window).trigger('bugbowl.team', 0);
				last_question = questions_cache['point_value'][square.parent().data('index') + (round * 4)].questions[square.data('index')];
			}
			else
			{
				var i = Math.floor(Math.random() * questions_cache.length);
				last_question = questions_cache['rebus_reveal'].splice(i, 1);

				// Only on client
				$('#team-indicator').text('Team '+team);
			}

			if(server)
			{
				localStorage.last_question = JSON.stringify(last_question);
				localStorage.questions_cache = JSON.stringify(questions_cache);
			}
		}

		$('.square').addClass('question-opened');
		$('#question-view').fadeIn(200);
		$('#question-text').text(last_question.question);

		// Only on server
		$('#question-answer').text(last_question.answer);
	});

	$('#question-correct').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify(JSON.parse(localStorage.bugbowl_event)
													   	    .concat({'type': 'question-correct'})
												   	   );
		}

		$('#question-view').fadeOut(200);
		square.addClass('question-answered');
		hidden_squares.push(square.attr('id'));
		if(mode == 'rebus_reveal')
		{
			scores[team-1] += 100;
			$(window).trigger('bugbowl.scores');
			if(team >= 3) { team = 1; }
			else team += 1;
		}
		else
		{
			scores[team-1] += square.parent().data('value');
			$(window).trigger('bugbowl.scores');
			team = 0;
		}
		last_question = '';
		square = '';

		if(server)
		{
			$(window).trigger('bugbowl.team', team);
			localStorage.scores = JSON.stringify(scores);
			localStorage.last_question = '';
			localStorage.hidden_squares = JSON.stringify(hidden_squares);
			localStorage.square = '';
		}
	});

	$('#question-wrong').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify(JSON.parse(localStorage.bugbowl_event)
													   	    .concat({'type': 'question-wrong'})
												   	   );
		}

		if(mode == 'rebus_reveal')
		{
			$('#question-view').fadeOut(200);
			last_question = '';
			square = '';

			if(server)
			{
				if(team >= 2) { team = 0; }
				else team += 1;
				$(window).trigger('bugbowl.team', team);
				localStorage.scores = JSON.stringify(scores);
				localStorage.last_question = '';
				localStorage.hidden_squares = JSON.stringify(hidden_squares);
				localStorage.square = '';
			}
		}
		else
		{
			scores[team-1] -= square.parent().data('value');
			$(window).trigger('bugbowl.scores');
			team = 0;

			if(server)
			{
				$(window).trigger('bugbowl.team', 0);
			}
		}
	});

	$(window).on('keyup', function(e) {
		if($('#question-view').css('display') != 'none') {
			if (e.which == 13) $('#question-correct').click();
		    else if (e.which == 27) $('#question-wrong').click();
		}
		else {
			if (e.which == 49)
			{
				$(window).trigger('bugbowl.team', 1);
			}
			else if (e.which == 50)
			{
				$(window).trigger('bugbowl.team', 2);
			}
			else if (e.which == 51)
			{
				$(window).trigger('bugbowl.team', 3);
			}
		}
	});

	$(window).on('bugbowl.team', function(e, t) {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify(JSON.parse(localStorage.bugbowl_event)
													   	    .concat({'type': 'bugbowl-team', 'team': t})
												   	   );
		}

		team = t;
		if(server)
		{
			localStorage.team = t;
		}

		if(mode == 'point_value' && team > 0)
		{
			// Only on client
			$('#team-indicator').text('Team '+team);
		}
		else
		{
			//Only on client
			$('#team-indicator').text('');
		}
	});

	$(window).on('bugbowl.scores', function() {
		if(server)
		{
			localStorage.scores = JSON.stringify(scores);
		}

		$('.score').each(function(index) {
			$(this).text(scores[index]);
		});
	});

	$(window).on('reload', function(e) {
		localStorage.bugbowl_event = JSON.stringify(JSON.parse(localStorage.bugbowl_event)
														.concat({'type': 'reset-game'})
												   );
	});

	$('#next-section').on('click', function() {
		if(server)
		{
			localStorage.bugbowl_event = JSON.stringify(JSON.parse(localStorage.bugbowl_event)
													   	    .concat({'type': 'next-section'})
												   	   );
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
						$('#board td').each(function() { $(this).text($(this).closest('tr').data('value')); });
						$('.category').each(function(index) { $(this).text(questions_cache['point_value'][index].name); });
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
						$('#categories').css('display', 'none');
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
			round = sections[section].split('-').pop() - 1;
			if(mode == "point_value") {
				$('#board td').each(function() { $(this).text($(this).closest('tr').data('value')); });
				$('.category').each(function(index) { $(this).text(questions_cache['point_value'][index + (round * 4)].name); });
				$('#categories').css('display', 'table');
			}
			else {
				$('.square').each(function(index) {
					$(this).text(index);
				});
				$('#categories').css('display', 'none');
			}
			if(server) { localStorage.round = round; }
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
			localStorage.bugbowl_event = JSON.stringify(JSON.parse(localStorage.bugbowl_event)
													   	    .concat({'type': 'reset-game'})
												   	   );
			resetStorage();
		}
		location.reload();
	});

	if(server)
	{
		localStorage.bugbowl_event = '[]';
		$('#next-section').click();
	}
	$(window).trigger('bugbowl.scores');
});

function resetStorage() {
	if(server)
	{
		localStorage.removeItem('questions_cache');
		localStorage.removeItem('last_question');
		localStorage.removeItem('square');
		localStorage.removeItem('hidden_squares');
		localStorage.removeItem('mode');
		localStorage.removeItem('scores');
		localStorage.removeItem('team');
		localStorage.removeItem('section');
	}
}
