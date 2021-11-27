<?php

namespace WoodiwissConsultants;

class ViewRenderer
{
	public array $ViewData;

	function __construct(public string $Title)
	{
		$this->Title = "";
		$this->ViewData = [];
	}

	//Renders the buffered output, configurable as to whether to use layout file, and which file to use.
	public function Render(string $viewPath, bool $useLayout = false, string $layoutFile = "_layout.php"): string
	{
		$renderedView = '';
		$this->ViewData['Title'] = $this->Title;

		ob_start();

		include $viewPath;

		$this->ViewData['Body'] = ob_get_clean();

		if ($useLayout === true && $layoutFile != null) {
			if (file_exists($layoutFile)) {
				ob_start();
				include $layoutFile;
				$renderedView = ob_get_clean();
			}
		} else {
			$renderedView = $this->ViewData['Body'];
		}

		return $renderedView;
	}
}

