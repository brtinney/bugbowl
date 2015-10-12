var rebus_reveal = [
	{	"question":		"question",
	 	"answer":		"answer"},
	{	"question":		"question",
		"answer":		"answer"}
]; // Randomly chosen from large list

var point_value = [
	{
		"name":			"Category",
		"questions":	[
			{	"question":		"question",
				"answer":		"answer"},
			{	"question":		"question",
				"answer":		"answer"},
			{	"question":		"question",
				"answer":		"answer"},
			{	"question":		"question",
				"answer":		"answer"}
		]
	}
]; // Should be 12 categories each with 4 questions/answers

var questions = {'rebus_reveal': rebus_reveal, 'point_value': point_value};

var GAMES = [
	{
		name: 'Rebus 1',
		type: 'rebus',
		image: 'assets/rebus-1.jpg',
		solution: 'Rebus Answer',
		questions: [
			{q: 'this is a question', a: 'answer1'},
			{q: 'this is another question', a: 'answer2'}
		],
		points: 100,
		boardClearPoints: 500
	},
	{
		name: 'Video 1',
		type: 'intermission',
		source: 'assets/video1.swf'
	},
	{
		name: 'Categories 1',
		type: 'categories',
		pointValues: [100, 200, 300, 500],
		board: [
			{ category: 'Topic 1',
				questions: [
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'},
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'}
				]
			},
			{ category: 'Topic 2',
				questions: [
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'},
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'}
				]
			},
			{ category: 'Topic 3',
				questions: [
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'},
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'}
				]
			},
			{ category: 'Topic 4',
				questions: [
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'},
					{q: 'this is a question', a: 'answer1'},
					{q: 'this is another question', a: 'answer2'}
				]
			}
		]
	}
];

var CONFIG = {
	teams: ['team1', 'team2', 'team3'],
	pointValues: [100, 200, 300, 500],
	transitionDuration: 200,
	rebusRow: 4,
	rebusColumn: 4
}
