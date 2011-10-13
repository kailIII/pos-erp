<?php
/** Empresa Data Access Object (DAO) Base.
  * 
  * Esta clase contiene toda la manipulacion de bases de datos que se necesita para 
  * almacenar de forma permanente y recuperar instancias de objetos {@link Empresa }. 
  * @author Andres
  * @access private
  * @abstract
  * @package docs
  * 
  */
abstract class EmpresaDAOBase extends DAO
{

		private static $loadedRecords = array();

		private static function recordExists(  $id_empresa ){
			$pk = "";
			$pk .= $id_empresa . "-";
			return array_key_exists ( $pk , self::$loadedRecords );
		}
		private static function pushRecord( $inventario,  $id_empresa){
			$pk = "";
			$pk .= $id_empresa . "-";
			self::$loadedRecords [$pk] = $inventario;
		}
		private static function getRecord(  $id_empresa ){
			$pk = "";
			$pk .= $id_empresa . "-";
			return self::$loadedRecords[$pk];
		}
	/**
	  *	Guardar registros. 
	  *	
	  *	Este metodo guarda el estado actual del objeto {@link Empresa} pasado en la base de datos. La llave 
	  *	primaria indicara que instancia va a ser actualizado en base de datos. Si la llave primara o combinacion de llaves
	  *	primarias describen una fila que no se encuentra en la base de datos, entonces save() creara una nueva fila, insertando
	  *	en ese objeto el ID recien creado.
	  *	
	  *	@static
	  * @throws Exception si la operacion fallo.
	  * @param Empresa [$empresa] El objeto de tipo Empresa
	  * @return Un entero mayor o igual a cero denotando las filas afectadas.
	  **/
	public static final function save( &$empresa )
	{
		if(  self::getByPK(  $empresa->getIdEmpresa() ) !== NULL )
		{
			try{ return EmpresaDAOBase::update( $empresa) ; } catch(Exception $e){ throw $e; }
		}else{
			try{ return EmpresaDAOBase::create( $empresa) ; } catch(Exception $e){ throw $e; }
		}
	}


	/**
	  *	Obtener {@link Empresa} por llave primaria. 
	  *	
	  * Este metodo cargara un objeto {@link Empresa} de la base de datos 
	  * usando sus llaves primarias. 
	  *	
	  *	@static
	  * @return @link Empresa Un objeto del tipo {@link Empresa}. NULL si no hay tal registro.
	  **/
	public static final function getByPK(  $id_empresa )
	{
		if(self::recordExists(  $id_empresa)){
			return self::getRecord( $id_empresa );
		}
		$sql = "SELECT * FROM empresa WHERE (id_empresa = ? ) LIMIT 1;";
		$params = array(  $id_empresa );
		global $conn;
		$rs = $conn->GetRow($sql, $params);
		if(count($rs)==0)return NULL;
			$foo = new Empresa( $rs );
			self::pushRecord( $foo,  $id_empresa );
			return $foo;
	}


	/**
	  *	Obtener todas las filas.
	  *	
	  * Esta funcion leera todos los contenidos de la tabla en la base de datos y construira
	  * un vector que contiene objetos de tipo {@link Empresa}. Tenga en cuenta que este metodo
	  * consumen enormes cantidades de recursos si la tabla tiene muchas filas. 
	  * Este metodo solo debe usarse cuando las tablas destino tienen solo pequenas cantidades de datos o se usan sus parametros para obtener un menor numero de filas.
	  *	
	  *	@static
	  * @param $pagina Pagina a ver.
	  * @param $columnas_por_pagina Columnas por pagina.
	  * @param $orden Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $tipo_de_orden 'ASC' o 'DESC' el default es 'ASC'
	  * @return Array Un arreglo que contiene objetos del tipo {@link Empresa}.
	  **/
	public static final function getAll( $pagina = NULL, $columnas_por_pagina = NULL, $orden = NULL, $tipo_de_orden = 'ASC' )
	{
		$sql = "SELECT * from empresa";
		if($orden != NULL)
		{ $sql .= " ORDER BY " . $orden . " " . $tipo_de_orden;	}
		if($pagina != NULL)
		{
			$sql .= " LIMIT " . (( $pagina - 1 )*$columnas_por_pagina) . "," . $columnas_por_pagina; 
		}
		global $conn;
		$rs = $conn->Execute($sql);
		$allData = array();
		foreach ($rs as $foo) {
			$bar = new Empresa($foo);
    		array_push( $allData, $bar);
			//id_empresa
    		self::pushRecord( $bar, $foo["id_empresa"] );
		}
		return $allData;
	}


	/**
	  *	Buscar registros.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link Empresa} de la base de datos. 
	  * Consiste en buscar todos los objetos que coinciden con las variables permanentes instanciadas de objeto pasado como argumento. 
	  * Aquellas variables que tienen valores NULL seran excluidos en busca de criterios.
	  *	
	  * <code>
	  *  /**
	  *   * Ejemplo de uso - buscar todos los clientes que tengan limite de credito igual a 20000
	  *   {@*} 
	  *	  $cliente = new Cliente();
	  *	  $cliente->setLimiteCredito("20000");
	  *	  $resultados = ClienteDAO::search($cliente);
	  *	  
	  *	  foreach($resultados as $c ){
	  *	  	echo $c->getNombre() . "<br>";
	  *	  }
	  * </code>
	  *	@static
	  * @param Empresa [$empresa] El objeto de tipo Empresa
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function search( $empresa , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from empresa WHERE ("; 
		$val = array();
		if( $empresa->getIdEmpresa() != NULL){
			$sql .= " id_empresa = ? AND";
			array_push( $val, $empresa->getIdEmpresa() );
		}

		if( $empresa->getIdDireccion() != NULL){
			$sql .= " id_direccion = ? AND";
			array_push( $val, $empresa->getIdDireccion() );
		}

		if( $empresa->getCurp() != NULL){
			$sql .= " curp = ? AND";
			array_push( $val, $empresa->getCurp() );
		}

		if( $empresa->getRfc() != NULL){
			$sql .= " rfc = ? AND";
			array_push( $val, $empresa->getRfc() );
		}

		if( $empresa->getRazonSocial() != NULL){
			$sql .= " razon_social = ? AND";
			array_push( $val, $empresa->getRazonSocial() );
		}

		if( $empresa->getRepresentanteLegal() != NULL){
			$sql .= " representante_legal = ? AND";
			array_push( $val, $empresa->getRepresentanteLegal() );
		}

		if( $empresa->getFechaAlta() != NULL){
			$sql .= " fecha_alta = ? AND";
			array_push( $val, $empresa->getFechaAlta() );
		}

		if( $empresa->getFechaBaja() != NULL){
			$sql .= " fecha_baja = ? AND";
			array_push( $val, $empresa->getFechaBaja() );
		}

		if( $empresa->getActivo() != NULL){
			$sql .= " activo = ? AND";
			array_push( $val, $empresa->getActivo() );
		}

		if( $empresa->getDireccionWeb() != NULL){
			$sql .= " direccion_web = ? AND";
			array_push( $val, $empresa->getDireccionWeb() );
		}

		if( $empresa->getMargenUtilidad() != NULL){
			$sql .= " margen_utilidad = ? AND";
			array_push( $val, $empresa->getMargenUtilidad() );
		}

		if( $empresa->getDescuento() != NULL){
			$sql .= " descuento = ? AND";
			array_push( $val, $empresa->getDescuento() );
		}

		if(sizeof($val) == 0){return array();}
		$sql = substr($sql, 0, -3) . " )";
		if( $orderBy !== null ){
		    $sql .= " order by " . $orderBy . " " . $orden ;
		
		}
		global $conn;
		$rs = $conn->Execute($sql, $val);
		$ar = array();
		foreach ($rs as $foo) {
			$bar =  new Empresa($foo);
    		array_push( $ar,$bar);
    		self::pushRecord( $bar, $foo["id_empresa"] );
		}
		return $ar;
	}


	/**
	  *	Actualizar registros.
	  *	
	  * Este metodo es un metodo de ayuda para uso interno. Se ejecutara todas las manipulaciones
	  * en la base de datos que estan dadas en el objeto pasado.No se haran consultas SELECT 
	  * aqui, sin embargo. El valor de retorno indica cu�ntas filas se vieron afectadas.
	  *	
	  * @internal private information for advanced developers only
	  * @return Filas afectadas o un string con la descripcion del error
	  * @param Empresa [$empresa] El objeto de tipo Empresa a actualizar.
	  **/
	private static final function update( $empresa )
	{
		$sql = "UPDATE empresa SET  id_direccion = ?, curp = ?, rfc = ?, razon_social = ?, representante_legal = ?, fecha_alta = ?, fecha_baja = ?, activo = ?, direccion_web = ?, margen_utilidad = ?, descuento = ? WHERE  id_empresa = ?;";
		$params = array( 
			$empresa->getIdDireccion(), 
			$empresa->getCurp(), 
			$empresa->getRfc(), 
			$empresa->getRazonSocial(), 
			$empresa->getRepresentanteLegal(), 
			$empresa->getFechaAlta(), 
			$empresa->getFechaBaja(), 
			$empresa->getActivo(), 
			$empresa->getDireccionWeb(), 
			$empresa->getMargenUtilidad(), 
			$empresa->getDescuento(), 
			$empresa->getIdEmpresa(), );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		return $conn->Affected_Rows();
	}


	/**
	  *	Crear registros.
	  *	
	  * Este metodo creara una nueva fila en la base de datos de acuerdo con los 
	  * contenidos del objeto Empresa suministrado. Asegurese
	  * de que los valores para todas las columnas NOT NULL se ha especificado 
	  * correctamente. Despues del comando INSERT, este metodo asignara la clave 
	  * primaria generada en el objeto Empresa dentro de la misma transaccion.
	  *	
	  * @internal private information for advanced developers only
	  * @return Un entero mayor o igual a cero identificando las filas afectadas, en caso de error, regresara una cadena con la descripcion del error
	  * @param Empresa [$empresa] El objeto de tipo Empresa a crear.
	  **/
	private static final function create( &$empresa )
	{
		$sql = "INSERT INTO empresa ( id_empresa, id_direccion, curp, rfc, razon_social, representante_legal, fecha_alta, fecha_baja, activo, direccion_web, margen_utilidad, descuento ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
		$params = array( 
			$empresa->getIdEmpresa(), 
			$empresa->getIdDireccion(), 
			$empresa->getCurp(), 
			$empresa->getRfc(), 
			$empresa->getRazonSocial(), 
			$empresa->getRepresentanteLegal(), 
			$empresa->getFechaAlta(), 
			$empresa->getFechaBaja(), 
			$empresa->getActivo(), 
			$empresa->getDireccionWeb(), 
			$empresa->getMargenUtilidad(), 
			$empresa->getDescuento(), 
		 );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		$ar = $conn->Affected_Rows();
		if($ar == 0) return 0;
		/* save autoincremented value on obj */  $empresa->setIdEmpresa( $conn->Insert_ID() ); /*  */ 
		return $ar;
	}


	/**
	  *	Buscar por rango.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link Empresa} de la base de datos siempre y cuando 
	  * esten dentro del rango de atributos activos de dos objetos criterio de tipo {@link Empresa}.
	  * 
	  * Aquellas variables que tienen valores NULL seran excluidos en la busqueda (los valores 0 y false no son tomados como NULL) .
	  * No es necesario ordenar los objetos criterio, asi como tambien es posible mezclar atributos.
	  * Si algun atributo solo esta especificado en solo uno de los objetos de criterio se buscara que los resultados conicidan exactamente en ese campo.
	  *	
	  * <code>
	  *  /**
	  *   * Ejemplo de uso - buscar todos los clientes que tengan limite de credito 
	  *   * mayor a 2000 y menor a 5000. Y que tengan un descuento del 50%.
	  *   {@*} 
	  *	  $cr1 = new Cliente();
	  *	  $cr1->setLimiteCredito("2000");
	  *	  $cr1->setDescuento("50");
	  *	  
	  *	  $cr2 = new Cliente();
	  *	  $cr2->setLimiteCredito("5000");
	  *	  $resultados = ClienteDAO::byRange($cr1, $cr2);
	  *	  
	  *	  foreach($resultados as $c ){
	  *	  	echo $c->getNombre() . "<br>";
	  *	  }
	  * </code>
	  *	@static
	  * @param Empresa [$empresa] El objeto de tipo Empresa
	  * @param Empresa [$empresa] El objeto de tipo Empresa
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function byRange( $empresaA , $empresaB , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from empresa WHERE ("; 
		$val = array();
		if( (($a = $empresaA->getIdEmpresa()) !== NULL) & ( ($b = $empresaB->getIdEmpresa()) !== NULL) ){
				$sql .= " id_empresa >= ? AND id_empresa <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " id_empresa = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getIdDireccion()) !== NULL) & ( ($b = $empresaB->getIdDireccion()) !== NULL) ){
				$sql .= " id_direccion >= ? AND id_direccion <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " id_direccion = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getCurp()) !== NULL) & ( ($b = $empresaB->getCurp()) !== NULL) ){
				$sql .= " curp >= ? AND curp <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " curp = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getRfc()) !== NULL) & ( ($b = $empresaB->getRfc()) !== NULL) ){
				$sql .= " rfc >= ? AND rfc <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " rfc = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getRazonSocial()) !== NULL) & ( ($b = $empresaB->getRazonSocial()) !== NULL) ){
				$sql .= " razon_social >= ? AND razon_social <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " razon_social = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getRepresentanteLegal()) !== NULL) & ( ($b = $empresaB->getRepresentanteLegal()) !== NULL) ){
				$sql .= " representante_legal >= ? AND representante_legal <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " representante_legal = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getFechaAlta()) !== NULL) & ( ($b = $empresaB->getFechaAlta()) !== NULL) ){
				$sql .= " fecha_alta >= ? AND fecha_alta <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " fecha_alta = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getFechaBaja()) !== NULL) & ( ($b = $empresaB->getFechaBaja()) !== NULL) ){
				$sql .= " fecha_baja >= ? AND fecha_baja <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " fecha_baja = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getActivo()) !== NULL) & ( ($b = $empresaB->getActivo()) !== NULL) ){
				$sql .= " activo >= ? AND activo <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " activo = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getDireccionWeb()) !== NULL) & ( ($b = $empresaB->getDireccionWeb()) !== NULL) ){
				$sql .= " direccion_web >= ? AND direccion_web <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " direccion_web = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getMargenUtilidad()) !== NULL) & ( ($b = $empresaB->getMargenUtilidad()) !== NULL) ){
				$sql .= " margen_utilidad >= ? AND margen_utilidad <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " margen_utilidad = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $empresaA->getDescuento()) !== NULL) & ( ($b = $empresaB->getDescuento()) !== NULL) ){
				$sql .= " descuento >= ? AND descuento <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a !== NULL|| $b !== NULL ){
			$sql .= " descuento = ? AND"; 
			$a = $a === NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		$sql = substr($sql, 0, -3) . " )";
		if( $orderBy !== null ){
		    $sql .= " order by " . $orderBy . " " . $orden ;
		
		}
		global $conn;
		$rs = $conn->Execute($sql, $val);
		$ar = array();
		foreach ($rs as $foo) {
    		array_push( $ar, new Empresa($foo));
		}
		return $ar;
	}


	/**
	  *	Eliminar registros.
	  *	
	  * Este metodo eliminara la informacion de base de datos identificados por la clave primaria
	  * en el objeto Empresa suministrado. Una vez que se ha suprimido un objeto, este no 
	  * puede ser restaurado llamando a save(). save() al ver que este es un objeto vacio, creara una nueva fila 
	  * pero el objeto resultante tendra una clave primaria diferente de la que estaba en el objeto eliminado. 
	  * Si no puede encontrar eliminar fila coincidente a eliminar, Exception sera lanzada.
	  *	
	  *	@throws Exception Se arroja cuando el objeto no tiene definidas sus llaves primarias.
	  *	@return int El numero de filas afectadas.
	  * @param Empresa [$empresa] El objeto de tipo Empresa a eliminar
	  **/
	public static final function delete( &$empresa )
	{
		if(self::getByPK($empresa->getIdEmpresa()) === NULL) throw new Exception('Campo no encontrado.');
		$sql = "DELETE FROM empresa WHERE  id_empresa = ?;";
		$params = array( $empresa->getIdEmpresa() );
		global $conn;

		$conn->Execute($sql, $params);
		return $conn->Affected_Rows();
	}


}
