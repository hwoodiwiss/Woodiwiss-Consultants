<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/Controllers/Controllers.php';
require_once __DIR__ . '/lib/includes.php';
require_once __DIR__ . '/Providers/includes.php';
require_once __DIR__ . '/Services/includes.php';
require_once __DIR__ . '/Db/includes.php';
require_once __DIR__ . '/Models/includes.php';
require_once __DIR__ . '/AppConfig.php';

class ContentManagementApi
{

	private Router $router;
	private DiContainer $diContainer;
	private AppConfig $config;
	private ControllerContext $controllerCtx;
	private string $route;
	private string $method;
	private ?Route $resolvedRoute;

	public function __construct()
	{
		$this->diContainer = new DiContainer();
		$this->router = new Router($this->diContainer);
	}

	public function main()
	{
		$this->route = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
		$this->method = $_SERVER['REQUEST_METHOD'];
		$localSettingsFile = __DIR__ . '/../settings.secrets.ini';
		$settingsFile = __DIR__ . '/../settings.ini';
		if (file_exists($localSettingsFile)) {
			$this->config = AppConfig::from($localSettingsFile);
		}
		else if (file_exists($settingsFile)) {
			$this->config = AppConfig::from($settingsFile);
		}
		else {
			throw new \RuntimeException('No Configuration could be found!');
		}
		$this->Startup();

		if ($this->method !== 'OPTIONS') {
			$this->resolvedRoute = $this->router->Get($this->route);
		}
		else {
			$this->resolvedRoute = $this->router->Get('/Options/HandleOptions');
		}

		$result = null;
		try {
			$result = $this->executeRoute();
		}
		catch (\Error $e) {
			$result = new CustomResult(500, 'Server Error Occurred');
		}

		foreach ($this->controllerCtx->responseHeaders as $name => $value) {
			if (is_array($value)) {
				$implodeHeader = implode(', ', $value);
				header("$name: $implodeHeader");
			}
			else {
				header("$name: $value");
			}
		}
		http_response_code($result->StatusCode());
		if (($content = $result->Body()) !== null) {
			$responseZip = gzencode($content);
			header('Content-Encoding: gzip');
			header('Content-Length: ' . strlen($responseZip));
			echo $responseZip;
		}

	}

	private function Startup()
	{
		Session::StartSession();
		$this->router
			->AddController(HomeController::class)
			->AddController(ContactController::class)
			->AddController(AccountController::class)
			->AddController(UserController::class)
			->AddController(ContentController::class)
			->AddController(OptionsController::class);

		$this->controllerCtx = (new ControllerContextBuilder)
			->AddRequestHeaders(getallheaders())
			->AddRequestMethod($_SERVER['REQUEST_METHOD'])
			->AddQuery($_SERVER['QUERY_STRING'] ?? '')
			->AddRequestBody(file_get_contents('php://input'))
			->AddCorsHeaders($this->config->cors->allowedorigins)
			->AddAllowCredentials()
			->Build();

		$this->diContainer->addInjectable(AppConfig::class , $this->config);
		$this->diContainer->addInjectable(ControllerContext::class , $this->controllerCtx);
		$this->diContainer->addInjectable(Session::class);
		$this->diContainer->addInjectable(Db::class);
		$this->diContainer->addInjectable(UsersContext::class);
		$this->diContainer->addInjectable(EditorContentContext::class);
		$this->diContainer->addInjectable(DateTimeProvider::class);
		$this->diContainer->addInjectable(JwtProvider::class);
		$this->diContainer->addInjectable(AuthorisationService::class , SessionAuthorisationService::class);
		$this->diContainer->addInjectable(RecaptchaService::class);
		$this->diContainer->addInjectable(EmailService::class);
		$this->diContainer->addInjectable(UserManagementService::class);
		$this->diContainer->addInjectable(ContentManagementService::class);

	}

	private function executeRoute(): IResult
	{
		if ($this->resolvedRoute !== null) {
			return $this->resolvedRoute->Execute($this->diContainer, $this->method, $this->controllerCtx);
		}
		else {
			return new NotFoundResult();
		}

	}
}
