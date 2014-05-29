$(document).ready(function(){
	var resultSets = {
			labels: [],
			datasets: [
				{
					fillColor: "rgba(0,110,220,0.5)",
					strokeColor: "rgba(0,110,220,1)",
					data: []
				}
				]
		};
		
	var currentResults = {
		name: '',
		count: ''
	};
	
	

	function toggler(targetSection){
		$(targetSection).slideToggle(500);	
	}
	
	function loadView(){
		$('.leftBlock').toggle();
		toggler('#main-section');
		toggler('#control-section');
		toggler('#topwords-section');
	};
	
	
	function analyzeText() {
		var str = $("#textInput").val();
		var excluded = $('#textExclude').val();
		if (str.length > 0){
		
			if ($('#removeSingleQuotes').is(':checked')){
				str = str.replace(/'/gm, '');
				excluded = excluded.replace(/'/gm, '');
			}
			
			if ($('#removeDashes').is(':checked')){
				str = str.replace(/-/gm, ' ').replace(/  +/g, ' ');
				excluded = excluded.replace(/-/gm, ' ').replace(/  +/g, ' ');
			}
			
			if ($('#removeEverything').is(':checked')){
				str = str.replace(/[&\/\\#,—_=+()()$~%\.":;*?!<>{}]/gm, ' ').replace(/(\r\n|\n|\r)/gm, " ").replace(/  +/g, ' ');
				excluded = excluded.replace(/[&\/\\#,—_=+()()$~%\.":;*?!<>{}]/gm, ' ').replace(/(\r\n|\n|\r)/gm, " ").replace(/  +/g, ' ');
			}
			
			if ($('#toLowerCase').is(':checked')){
				str = str.toLowerCase();
				excluded = excluded.toLowerCase();
			}
			
			var excludedArray = excluded.split(" ");
			
			var totalWordCount = str.split(" ").length;
				
			var split = str.split(" "),
				obj = {};
			var count = 0;
			var excludedCount = 0;
			var inputLength = split.length;
			var userLength = parseInt($("#maxWords").val());

			if  (((inputLength < userLength) == false) && (isNaN(userLength) == false)){
				inputLength = userLength;
			}
			
			// make the basic JSON Object
			for (var x = 0; x < inputLength; x++) {
				if ((split[x] != '') && (excludedArray.indexOf(split[x]) < 0)) {
					if (obj[split[x]] === undefined) {
						obj[split[x]] = 1;
						count++;
					} else {
						obj[split[x]]++;
					}
				}
				else{
					excludedCount++;
				}
			}
			
			var nameCountJSON = [];
			var labels = [];
			var dataset = [];
		
			
			//make the {word: "", count: ""} array JSON from our existing object 
			for (var key in obj){
				nameCountJSON.push({word: key, count: obj[key]});
			}
			
			//sort the JSON Object:
			function compare(a,b) {
				if (a.count > b.count)
					return -1;
				if (a.count < b.count)
					return 1;
				return 0;
			};
			
			nameCountJSON.sort(compare);
			
			//make the chart data from nameCountJSON
			for (var i = 0; i < nameCountJSON.length; i++){
				labels.push(nameCountJSON[i].word);
				dataset.push(nameCountJSON[i].count);
			}
			
			var topWords = 20 > count ? count : 20;
			
			
			//chart data object made from our sorted set up
			var chartData = {
				labels: labels.slice(0, topWords),
				datasets: [
					{
						fillColor: "rgba(0,110,220,0.5)",
						strokeColor: "rgba(0,110,220,1)",
						data: dataset.slice(0, topWords)
					}
					]
			};
			
			//chart stuff
			//dynamic canvas size based on window.
			var chartWidth = $(window).innerWidth() - 50;
			$("#wordChartContainer").html('<canvas id="wordChart" width="' 
				+ chartWidth + '" height="400"></canvas>');
			$("#wordChartContainer")
			
			var ctx = $("#wordChart").get(0).getContext("2d");
			var chartOptions = {
				scaleOverride : true,
				scaleSteps : 10,
				scaleStepWidth : dataset[0]/10,
				scaleStartValue : 0,
				scaleFontFamily : "'Open Sans'", 
			};
			var wordChart = new Chart(ctx).Bar(chartData, chartOptions);

			
			$('#resultSummary').html("Total Unique Words: " + count 
				+ "<br />Total Word Count: " + totalWordCount 
				+ "<br />Total Word Processed: " + inputLength 
				+ "<br />Excluded Word Count: " + excludedCount 
				+ "<br />Total Words - Excluded Words: " + (totalWordCount-excludedCount)
				+ "<br />Precentage of Unique Vocabulary: " 
				+ ((count/totalWordCount)*100).toPrecision(8) + '%'
				+ "<br />Precentage of Unique Vocabulary Minus Exclusions: " 
				+ ((count/(totalWordCount-excludedCount))*100).toPrecision(8) + '%<br /><br />'
				);
				

			$('#resultJSON').html(JSON.stringify(obj));
			$('#resultJSONWord').html(JSON.stringify(nameCountJSON));
			$('#processedInput').html(str);
			$('#resultCSV').html(labels.toString(' '));
			
			currentResults.name = $("#resultSetName").val();
			currentResults.count = count;
		}
	}
	
	function saveResults() {
		resultSets.labels.push(currentResults.name);
		resultSets.datasets[0].data.push(currentResults.count);
		var chartWidth = $(window).innerWidth() - 50;
		$("#sampleChartContainer").html('<canvas id="resultChart" width="' 
			+ chartWidth + '" height="400"></canvas>');
		
		
		
		//min max behavior of graph
		var sortedResults = [];
		for (var i = 0; i < resultSets.datasets[0].data.length; i++){
			sortedResults.push(resultSets.datasets[0].data[i]);
		}
		sortedResults.sort().reverse();
		
		var ctx = $("#resultChart").get(0).getContext("2d");
		var chartOptions = {
			scaleOverride : true,
			scaleSteps : 10,
			scaleStepWidth : sortedResults[0]/10,
			scaleStartValue : 0,
			scaleFontFamily : "'Open Sans'", 
		};
		var resultChart = new Chart(ctx).Bar(resultSets, chartOptions);
	}

	$('#check').click(function (){analyzeText()});
	$('#save').click(function (){
		analyzeText();
		saveResults();
	});
	
	$('#mainToggle').click(function(){
		toggler("#main-section");
	});
	$('#excludeToggle').click(function(){
		toggler("#exclude-section");
	});
	$('#jsonlistToggle').click(function(){
		toggler("#jsonlist-section");
	});
	$('#processedToggle').click(function(){
		toggler("#processed-section");
	});
	$('#jsonobjectToggle').click(function(){
		toggler("#jsonobject-section");
	});
	$('#csvToggle').click(function(){
		toggler("#csv-section");
	});
	$('#topwordsToggle').click(function(){
		toggler("#topwords-section");
	});
	$('#resultsToggle').click(function(){
		toggler("#results-section");
	});
	
	
	loadView();
	analyzeText();
});