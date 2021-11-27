<?php

$found_includes = [];
foreach (glob(__DIR__ . '/*.php') as $include) {
	$found_includes[] = $include;
	if (!str_ends_with($include, __FILE__ )) {
		require_once $include;
	}
}
