<?php

$found_includes = [];
foreach (glob(__DIR__ . '/*.php') as $include) {
	$found_includes[] = $include;
	if (!str_ends_with($include, __FILE__)) {
		require_once $include;
	}
}

$found_includes[] = __DIR__ . '/Results/Results.php';
require_once __DIR__ . '/Results/Results.php';

foreach (glob(__DIR__ . '/Controller/*.php') as $include) {
	$found_includes[] = $include;
	if (!str_ends_with($include, __FILE__)) {
		require_once $include;
	}
}

foreach (glob(__DIR__ . '/View/*.php') as $include) {
	$found_includes[] = $include;
	if (!str_ends_with($include, __FILE__)) {
		require_once $include;
	}
}