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
		solution: 'this is the answer',
		questions: [
			{q: 'this is a question', a: 'answer1'},
			{q: 'this is another question', a: 'answer2'}
		],
		points: 100
	},
	{
		name: 'Video 1',
		type: 'intermission',
		source: 'assets/video1.swf'
	},
	{
		name: 'Jeopardy 1',
		type: 'jeopardy',
		pointValues: [100, 200, 300, 400, 500],
		board: [
			{category: 'Topic 1'},
			{category: 'Topic 2'}
		]
	}
];

var CONFIG = {
	teams: ['team1', 'team2', 'team3', 'team4'],
	pointValues: [100, 200, 300, 400, 500],
	transitionDuration: 200,
	rebusRow: 4,
	rebusColumn: 4
}
