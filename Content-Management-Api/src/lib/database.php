<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/utils.php';
include_once __DIR__ . '/../AppConfig.php';

/*
THIS IS CONSIDERED LEGACY CODE
*/
class Db extends \PDO
{
	//Basic cache for storing navigation values within a single request
	//Very naiive implemetation, will probably opt for proper ctx management in later version
	public static $Cache = array();
	private array $registeredTableContexts;

	public function __construct(AppConfig $appConfig)
	{
		$this->registeredTableContexts = [];
		$connString = $appConfig->database->driver .
			':host=' . $appConfig->database->host .
			((!empty($appConfig->database->port)) ? (';port=' . $appConfig->database->port) : '') .
			';dbname=' . $appConfig->database->database;

		parent::__construct($connString, $appConfig->database->username, $appConfig->database->password);
	}

	public function registerTableContext(DbTableContext &$context) 
	{
		$this->registeredTableContexts[$context->TableName] = $context;
	}

	public function getRegisteredTableContext(string $tableName): ?DbTableContext
	{
		return $this->registeredTableContexts[$tableName];
	}
}

//Class to derive DB Data models from
class DbData
{

	//Uses data in assoc array from DB to construct the properties, setting correct types where necessary
	public function __construct(private ?DbTableContext $dbTable = null, array $dbObject = null)
	{
		if ($dbObject != null) {
			$class = new \ReflectionClass($this);
			$props = $class->getProperties(\ReflectionProperty::IS_PUBLIC);
			foreach ($props as /** @var \ReflectionProperty*/$prop) {
				$key = $prop->getName();
				if(isset($dbObject[$key])) {
					$this->$key = $dbObject[$key];
				} else if ($prop->getType()->allowsNull()) {
					$this->$key = null;
				}
			}
		}
	}

	//Using __get magic function to create virtual navigation properties to other DbData classes
	public function __get($Name)
	{
		if($this->dbTable === null) throw new \Error("Navigation attempted on non-navigable property.\r\n" . 
		"Navigation can only be done on objects created by a table context.");
		$ClassName = get_class($this);
		$Props = get_object_vars($this);

		foreach ($Props as $Prop => $Val) {
			$annotations = Utils::GetPropertyAnnotations($ClassName, $Prop);
			$ForeignAlias = Utils::SafeGetValue($annotations, "fkey-alias");
			if ($ForeignAlias == $Name) {
				$ForeignTable = Utils::SafeGetValue($annotations, "fkey-table");
				if ($ForeignTable != null) {
					$ForeignType = substr($ForeignTable, 0, -1);
					$CacheName = $ForeignTable . "_" . $Val;
					//Checks the cache to see if this object already exists
					if (!array_key_exists($CacheName, Db::$Cache)) {
						//If not, makes a database request to get it
						Db::$Cache[$CacheName] = $this->dbTable->db->getRegisteredTableContext($ForeignTable)->Find($Val);
					}
					//Returns requested object from the DB Cache
					return Db::$Cache[$CacheName];
				}
			}
		}

		throw new \Exception("Invalid navigation property: " . $Name . "!");
	}

	//Gets a partially full copy of the object
	public function GetPartial(array $propNames)
	{
		$props = get_object_vars($this);
		$output = array();
		foreach ($propNames as $index => $value) {
			$propVal = Utils::SafeGetValue($props, $value);
			if ($propVal != null) {
				$output[$value] = $propVal;
			}
		}

		return $output;
	}

	public static function FromJson(string $jsonString, string $typeName)
	{
		if (!class_exists($typeName)) return null;
		$outObj = new $typeName();
		$jsobj = json_decode($jsonString, true);
		$props = get_object_vars($outObj);
		foreach ($props as $key => $value) {
			$outObj->$key = Utils::SafeGetValue($jsobj, $key);
		}

		return $outObj;
	}

	public function AsJson()
	{
		return json_encode($this);
	}
}

class DbCondition
{
	public $Column;
	private $Operation;
	public $Value;

	public function __construct(string $Column, $Value, string $Operation = "eq")
	{
		$this->Column = $Column;
		$this->Value = $Value;
		$this->Operation = $Operation;
	}

	public function GetOperation(): string
	{
		$opText = "";
		if ($this->Operation == "like") {
			$opText = " LIKE ";
		} else if ($this->Operation == "gt") {
			$opText = " > ";
		} else if ($this->Operation == "lt") {
			$opText = " < ";
		} else if ($this->Operation == "ge") {
			$opText = " >= ";
		} else if ($this->Operation == "le") {
			$opText = " <= ";
		} else {
			$opText = " = ";
		}

		return $opText;
	}
}

//Helper class for easily constructing basic SQL requests and retuning serialized results
abstract class DbTableContext
{
	public $TableName;
	private \ReflectionClass $Type;
	private Mapper $mapper;

	public function __construct(public Db $db, string $TypeName, string $TableName = '')
	{
		$this->Type = new \ReflectionClass($TypeName);
		$this->Mapper = new Mapper($TypeName);
		if (!$this->Type->isSubclassOf(DbData::class)) throw new \Exception($TypeName . " is not a valid DbData object");

		if ($TableName == '') {
			$this->TableName = $this->Type->getShortName() . 's';
		} else {
			$this->TableName = $TableName;
		}

		$db->registerTableContext($this);
	}

	//Inserts a new object of the type that this DbHelper is configured for
	public function InsertObj($object): string
	{
		//Make sure that the object is the right type
		if (!$this->Type->isInstance($object)) throw new \Exception("Invalid object type for this helper!");

		$objVals = get_object_vars($object);
		$columnVals = array();
		foreach ($objVals as $Var => $Val) {
			if ($Val != null && $Var != "Id") {
				$columnVals[$Var] = $Val;
			}
		}

		return $this->Insert($columnVals);
	}

	//Inserts new row into the table with specified values
	public function Insert(array $ColumnVals): string
	{
		$insertString = "INSERT INTO " . $this->TableName . " (" . $this->BuildInsertColsString($ColumnVals)
			. ") VALUES (" . $this->BuildInsertValuesString($ColumnVals) . ");";

		$stmt = $this->db->prepare($insertString);

		$count = 0;
		foreach ($ColumnVals as $Column => $Val) {
			$paramStr = ":v" . $count;
			if (!$stmt->bindValue($paramStr, $Val, $this->GetPdoParam($Val))) {
				var_dump($stmt);
				throw new \Exception("Failed to bind parameter " . $paramStr . " Value: " . $Val);
			}
			$count++;
		}

		if (!$stmt->execute()) {
			throw new \Exception("An error occured updating the database. Error info: " . $stmt->errorInfo()[2]);
		}

		return $this->db->lastInsertId();
	}

	//Selectts data from the database
	public function Select(array $Columns, array $Conditions = [], string $OrderColumn = "", string $OrderDir = "ASC")
	{
		$colsString = "";
		$conditionString = "";
		$selectString = "SELECT ";

		$colsString = $this->BuildSelectString($Columns);

		$selectString .= $colsString . ' FROM ' . $this->TableName;

		if ($Conditions != []) {
			$selectString .= $this->BuildConditionString($Conditions);
		}

		if ($OrderColumn != "") {
			$selectString .= " ORDER BY " . $OrderColumn . " " . $OrderDir;
		}

		$selectString .= ";";

		$stmt = $this->db->prepare($selectString);

		if ($Conditions != []) {
			$count = 0;
			foreach ($Conditions as $Condition) {
				if ($Condition::class == DbCondition::class) {
					$paramStr = ":c" . $count;
					$stmt->bindValue($paramStr, $Condition->Value, $this->GetPdoParam($Condition->Value));
					$count++;
				}
			}
		}

		if (!$stmt->execute()) {
			throw new \Exception("An error occured retrieving data from the database. Error info: " . $stmt->errorInfo()[2]);
		}

		$data = $stmt->fetchAll();

		$numRows = count($data);
		$outData = array();
		for ($index = 0; $index < $numRows; $index++) {
			$outData[$index] = $this->Type->newInstance($this, $data[$index]);
		}

		return $outData;
	}

	//Finds the record with the requested Id
	public function Find(string $Id, array $Columns = [])
	{
		$colsString = $this->BuildSelectString($Columns);
		$selectString = "SELECT " . $colsString . " FROM " . $this->TableName . " WHERE Id = :id;";

		$stmt = $this->db->prepare($selectString);
		$stmt->bindValue(":id", $Id, $this->GetPdoParam($Id));

		if (!$stmt->execute()) {
			throw new \Exception("An error occured retrieving data from the database. Error info: " . $stmt->errorInfo()[2]);
		}

		$data = $stmt->fetchAll();
		$numRows = count($data);
		$outVal = null;
		if ($numRows > 1) {
			throw new \Exception("A primary key search yeilded multiple results. This should not be possible.");
		}

		if ($numRows == 1) {
			$outVal = $this->Type->newInstance($this, $data[0]);
		}

		return $outVal;
	}

	//Updates an object of the type that this DbHelper is configured for
	public function UpdateObj($object)
	{
		if ($object::class != $this->Type->getName()) throw new \Exception("Invalid object type for this helper!");

		$objVals = get_object_vars($object);
		$columnVals = array();
		foreach ($objVals as $Var => $Val) {
			$columnVals[$Var] = $Val;
		}
		$this->Update($columnVals, [new DbCondition("Id", $object->Id)]);
	}

	//Updates an object in the database
	public function Update(array $ColumnVals, array $Conditions = [])
	{
		$updateString = "UPDATE " . $this->TableName . " SET "
			. $this->BuildPreparedValuesString($ColumnVals) . $this->BuildConditionString($Conditions) . ";";

		$stmt = $this->db->prepare($updateString);

		$count = 0;
		foreach ($ColumnVals as $Column => $Val) {
			$paramStr = ":v" . $count;
			if (!$stmt->bindValue($paramStr, $Val, $this->GetPdoParam($Val))) {
				throw new \Exception("Failed to bind parameter " . $paramStr . " Value: " . $Val);
			}
			$count++;
		}

		if ($Conditions != []) {
			$count = 0;
			foreach ($Conditions as $Condition) {
				if ($Condition::class === DbCondition::class) {
					$paramStr = ":c" . $count;
					if (!$stmt->bindValue($paramStr, $Condition->Value, $this->GetPdoParam($Condition->Value))) {
						throw new \Exception("Failed to bind parameter " . $paramStr . " Value: " . $Condition->Value);
					}
					$count++;
				}
			}
		}
		if (!$stmt->execute()) {
			throw new \Exception("An error occured updating the database. Error info: " . $stmt->errorInfo()[2]);
		}
	}

	public function Delete($Id)
	{
		$deleteString = "DELETE FROM " . $this->TableName . " WHERE Id = :v0";

		$stmt = $this->db->prepare($deleteString);
		$stmt->bindValue(":v0", $Id, $this->GetPdoParam($Id));

		if (!$stmt->execute()) {
			throw new \Exception("An error occured updating the database. Error info: " . $stmt->errorInfo()[2]);
		}
	}

	private function BuildSelectString(array $Columns): string
	{
		$colsString = "";
		if ($Columns != []) {
			$numColumns = count($Columns);
			for ($index = 0; $index < $numColumns; $index++) {
				if ($index != 0) {
					$colsString .= ", ";
				}

				$colsString .= $Columns[$index];
			}
		} else {
			$colsString = '*';
		}

		return $colsString;
	}

	private function BuildInsertColsString(array $Columns): string
	{
		$colsString = "";
		if ($Columns != []) {
			$count = 0;
			foreach ($Columns as $Key => $Val) {
				if ($count != 0) {
					$colsString .= ", ";
				}

				$colsString .= $Key;
				$count++;
			}
		} else {
			$colsString = '*';
		}

		return $colsString;
	}

	private function BuildPreparedValuesString(array $Values): string
	{
		$valuesString = "";
		if ($Values != []) {
			$count = 0;
			foreach ($Values as $Column => $Value) {

				if ($count > 0) {
					$valuesString .= ", ";
				}

				$valuesString .= $Column . " = :v" . $count;
				$count++;
			}
		}

		return $valuesString;
	}

	private function BuildInsertValuesString(array $Values): string
	{
		$valuesString = "";
		if ($Values != []) {
			$count = 0;
			foreach ($Values as $Column => $Value) {
				if ($Value != null) {
					if ($count > 0) {
						$valuesString .= ", ";
					}
					$valuesString .= ":v" . $count;
					$count++;
				}
			}
		}

		return $valuesString;
	}

	private function BuildConditionString(array $Conditions): string
	{
		$conditionString = "";
		if ($Conditions != []) {
			$conditionString .= ' WHERE ';
			$count = 0;
			foreach ($Conditions as $Condition) {
				if ($Condition::class == DbCondition::class) {
					if ($count > 0) {
						$conditionString .= " AND ";
					}
					$isInt = gettype($Condition->Value) == "integer";
					$conditionString .= $Condition->Column . $Condition->GetOperation() . ":c" . $count;
					$count++;
				}
			}
		}

		return $conditionString;
	}

	private function GetPdoParam($value)
	{
		$typeString = gettype($value);

		$ParamType = \PDO::PARAM_STR;

		if ($typeString == "integer") {
			$ParamType = \PDO::PARAM_INT;
		} else if ($typeString == "boolean") {
			$ParamType = \PDO::PARAM_BOOL;
		}

		return $ParamType;
	}
}
