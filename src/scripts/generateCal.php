<?php

date_default_timezone_set('UTC');

include('lib/Logging.class.php');

function createCalendarLine($arr, $date){
	$content='';
	$content.='"Day '.$arr['day'].': '.ucfirst($arr['read']).'",';
	$content.=date_format($date,"m/d/Y").',';
	$content.='true,';
	$content.='"READ: '.ucfirst($arr['read']).' PRAY: '.ucfirst($arr['meditation']);

	if(array_key_exists('video', $arr)){
		$content.=' WATCH: '.ucfirst($arr['video']);
	}

	$content.=' http://bible.sograce.org/#/'.$arr['day'].'/1"';

	return $content;
}

$jsonLocation="../js/plan_tbp.json";

$milliseconds = round(microtime(true) * 1000);
$fileName='calendar_'.$milliseconds.'.csv';

//we'll just use the logging class, since i have it handy
$log=new Logging();
$log->lfile($fileName);

//read in the json
$string=file_get_contents($jsonLocation);
$json_a=json_decode($string,true);

//lets create th initial start date
$seedDate=date_create("2016-01-01");

//create the initial header file
$log->lwrite('Subject,Start Date,All Day Event,Description');


foreach($json_a as $v){
	if(!empty($v)){
		$cLine = createCalendarLine($v, $seedDate);
		$log->lwrite($cLine, false);

		//increase date
		date_add($seedDate,date_interval_create_from_date_string("1 day"));
	}
}

echo '<a href="'.$fileName.'">Download</a>';

?>