<?php
/** ConsignacionProducto Data Access Object (DAO) Base.
  * 
  * Esta clase contiene toda la manipulacion de bases de datos que se necesita para 
  * almacenar de forma permanente y recuperar instancias de objetos {@link ConsignacionProducto }. 
  * @author Andres
  * @access private
  * @abstract
  * @package docs
  * 
  */
abstract class ConsignacionProductoDAOBase extends DAO
{

		private static $loadedRecords = array();

		private static function recordExists(  $id_consignacion, $id_producto ){
			$pk = "";
			$pk .= $id_consignacion . "-";
			$pk .= $id_producto . "-";
			return array_key_exists ( $pk , self::$loadedRecords );
		}
		private static function pushRecord( $inventario,  $id_consignacion, $id_producto){
			$pk = "";
			$pk .= $id_consignacion . "-";
			$pk .= $id_producto . "-";
			self::$loadedRecords [$pk] = $inventario;
		}
		private static function getRecord(  $id_consignacion, $id_producto ){
			$pk = "";
			$pk .= $id_consignacion . "-";
			$pk .= $id_producto . "-";
			return self::$loadedRecords[$pk];
		}
	/**
	  *	Guardar registros. 
	  *	
	  *	Este metodo guarda el estado actual del objeto {@link ConsignacionProducto} pasado en la base de datos. La llave 
	  *	primaria indicara que instancia va a ser actualizado en base de datos. Si la llave primara o combinacion de llaves
	  *	primarias describen una fila que no se encuentra en la base de datos, entonces save() creara una nueva fila, insertando
	  *	en ese objeto el ID recien creado.
	  *	
	  *	@static
	  * @throws Exception si la operacion fallo.
	  * @param ConsignacionProducto [$consignacion_producto] El objeto de tipo ConsignacionProducto
	  * @return Un entero mayor o igual a cero denotando las filas afectadas.
	  **/
	public static final function save( &$consignacion_producto )
	{
		if(  self::getByPK(  $consignacion_producto->getIdConsignacion() , $consignacion_producto->getIdProducto() ) !== NULL )
		{
			try{ return ConsignacionProductoDAOBase::update( $consignacion_producto) ; } catch(Exception $e){ throw $e; }
		}else{
			try{ return ConsignacionProductoDAOBase::create( $consignacion_producto) ; } catch(Exception $e){ throw $e; }
		}
	}


	/**
	  *	Obtener {@link ConsignacionProducto} por llave primaria. 
	  *	
	  * Este metodo cargara un objeto {@link ConsignacionProducto} de la base de datos 
	  * usando sus llaves primarias. 
	  *	
	  *	@static
	  * @return @link ConsignacionProducto Un objeto del tipo {@link ConsignacionProducto}. NULL si no hay tal registro.
	  **/
	public static final function getByPK(  $id_consignacion, $id_producto )
	{
		if(self::recordExists(  $id_consignacion, $id_producto)){
			return self::getRecord( $id_consignacion, $id_producto );
		}
		$sql = "SELECT * FROM consignacion_producto WHERE (id_consignacion = ? AND id_producto = ? ) LIMIT 1;";
		$params = array(  $id_consignacion, $id_producto );
		global $conn;
		$rs = $conn->GetRow($sql, $params);
		if(count($rs)==0)return NULL;
			$foo = new ConsignacionProducto( $rs );
			self::pushRecord( $foo,  $id_consignacion, $id_producto );
			return $foo;
	}


	/**
	  *	Obtener todas las filas.
	  *	
	  * Esta funcion leera todos los contenidos de la tabla en la base de datos y construira
	  * un vector que contiene objetos de tipo {@link ConsignacionProducto}. Tenga en cuenta que este metodo
	  * consumen enormes cantidades de recursos si la tabla tiene muchas filas. 
	  * Este metodo solo debe usarse cuando las tablas destino tienen solo pequenas cantidades de datos o se usan sus parametros para obtener un menor numero de filas.
	  *	
	  *	@static
	  * @param $pagina Pagina a ver.
	  * @param $columnas_por_pagina Columnas por pagina.
	  * @param $orden Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $tipo_de_orden 'ASC' o 'DESC' el default es 'ASC'
	  * @return Array Un arreglo que contiene objetos del tipo {@link ConsignacionProducto}.
	  **/
	public static final function getAll( $pagina = NULL, $columnas_por_pagina = NULL, $orden = NULL, $tipo_de_orden = 'ASC' )
	{
		$sql = "SELECT * from consignacion_producto";
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
			$bar = new ConsignacionProducto($foo);
    		array_push( $allData, $bar);
			//id_consignacion
			//id_producto
    		self::pushRecord( $bar, $foo["id_consignacion"],$foo["id_producto"] );
		}
		return $allData;
	}


	/**
	  *	Buscar registros.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link ConsignacionProducto} de la base de datos. 
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
	  * @param ConsignacionProducto [$consignacion_producto] El objeto de tipo ConsignacionProducto
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function search( $consignacion_producto , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from consignacion_producto WHERE ("; 
		$val = array();
		if( $consignacion_producto->getIdConsignacion() != NULL){
			$sql .= " id_consignacion = ? AND";
			array_push( $val, $consignacion_producto->getIdConsignacion() );
		}

		if( $consignacion_producto->getIdProducto() != NULL){
			$sql .= " id_producto = ? AND";
			array_push( $val, $consignacion_producto->getIdProducto() );
		}

		if( $consignacion_producto->getCantidad() != NULL){
			$sql .= " cantidad = ? AND";
			array_push( $val, $consignacion_producto->getCantidad() );
		}

		if( $consignacion_producto->getImpuesto() != NULL){
			$sql .= " impuesto = ? AND";
			array_push( $val, $consignacion_producto->getImpuesto() );
		}

		if( $consignacion_producto->getDescuento() != NULL){
			$sql .= " descuento = ? AND";
			array_push( $val, $consignacion_producto->getDescuento() );
		}

		if( $consignacion_producto->getRetencion() != NULL){
			$sql .= " retencion = ? AND";
			array_push( $val, $consignacion_producto->getRetencion() );
		}

		if( $consignacion_producto->getPrecio() != NULL){
			$sql .= " precio = ? AND";
			array_push( $val, $consignacion_producto->getPrecio() );
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
			$bar =  new ConsignacionProducto($foo);
    		array_push( $ar,$bar);
    		self::pushRecord( $bar, $foo["id_consignacion"],$foo["id_producto"] );
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
	  * @param ConsignacionProducto [$consignacion_producto] El objeto de tipo ConsignacionProducto a actualizar.
	  **/
	private static final function update( $consignacion_producto )
	{
		$sql = "UPDATE consignacion_producto SET  cantidad = ?, impuesto = ?, descuento = ?, retencion = ?, precio = ? WHERE  id_consignacion = ? AND id_producto = ?;";
		$params = array( 
			$consignacion_producto->getCantidad(), 
			$consignacion_producto->getImpuesto(), 
			$consignacion_producto->getDescuento(), 
			$consignacion_producto->getRetencion(), 
			$consignacion_producto->getPrecio(), 
			$consignacion_producto->getIdConsignacion(),$consignacion_producto->getIdProducto(), );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		return $conn->Affected_Rows();
	}


	/**
	  *	Crear registros.
	  *	
	  * Este metodo creara una nueva fila en la base de datos de acuerdo con los 
	  * contenidos del objeto ConsignacionProducto suministrado. Asegurese
	  * de que los valores para todas las columnas NOT NULL se ha especificado 
	  * correctamente. Despues del comando INSERT, este metodo asignara la clave 
	  * primaria generada en el objeto ConsignacionProducto dentro de la misma transaccion.
	  *	
	  * @internal private information for advanced developers only
	  * @return Un entero mayor o igual a cero identificando las filas afectadas, en caso de error, regresara una cadena con la descripcion del error
	  * @param ConsignacionProducto [$consignacion_producto] El objeto de tipo ConsignacionProducto a crear.
	  **/
	private static final function create( &$consignacion_producto )
	{
		$sql = "INSERT INTO consignacion_producto ( id_consignacion, id_producto, cantidad, impuesto, descuento, retencion, precio ) VALUES ( ?, ?, ?, ?, ?, ?, ?);";
		$params = array( 
			$consignacion_producto->getIdConsignacion(), 
			$consignacion_producto->getIdProducto(), 
			$consignacion_producto->getCantidad(), 
			$consignacion_producto->getImpuesto(), 
			$consignacion_producto->getDescuento(), 
			$consignacion_producto->getRetencion(), 
			$consignacion_producto->getPrecio(), 
		 );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		$ar = $conn->Affected_Rows();
		if($ar == 0) return 0;
		/* save autoincremented value on obj */   /*  */ 
		return $ar;
	}


	/**
	  *	Buscar por rango.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link ConsignacionProducto} de la base de datos siempre y cuando 
	  * esten dentro del rango de atributos activos de dos objetos criterio de tipo {@link ConsignacionProducto}.
	  * 
	  * Aquellas variables que tienen valores NULL seran excluidos en la busqueda. 
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
	  * @param ConsignacionProducto [$consignacion_producto] El objeto de tipo ConsignacionProducto
	  * @param ConsignacionProducto [$consignacion_producto] El objeto de tipo ConsignacionProducto
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function byRange( $consignacion_productoA , $consignacion_productoB , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from consignacion_producto WHERE ("; 
		$val = array();
		if( (($a = $consignacion_productoA->getIdConsignacion()) != NULL) & ( ($b = $consignacion_productoB->getIdConsignacion()) != NULL) ){
				$sql .= " id_consignacion >= ? AND id_consignacion <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " id_consignacion = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $consignacion_productoA->getIdProducto()) != NULL) & ( ($b = $consignacion_productoB->getIdProducto()) != NULL) ){
				$sql .= " id_producto >= ? AND id_producto <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " id_producto = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $consignacion_productoA->getCantidad()) != NULL) & ( ($b = $consignacion_productoB->getCantidad()) != NULL) ){
				$sql .= " cantidad >= ? AND cantidad <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " cantidad = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $consignacion_productoA->getImpuesto()) != NULL) & ( ($b = $consignacion_productoB->getImpuesto()) != NULL) ){
				$sql .= " impuesto >= ? AND impuesto <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " impuesto = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $consignacion_productoA->getDescuento()) != NULL) & ( ($b = $consignacion_productoB->getDescuento()) != NULL) ){
				$sql .= " descuento >= ? AND descuento <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " descuento = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $consignacion_productoA->getRetencion()) != NULL) & ( ($b = $consignacion_productoB->getRetencion()) != NULL) ){
				$sql .= " retencion >= ? AND retencion <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " retencion = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $consignacion_productoA->getPrecio()) != NULL) & ( ($b = $consignacion_productoB->getPrecio()) != NULL) ){
				$sql .= " precio >= ? AND precio <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " precio = ? AND"; 
			$a = $a == NULL ? $b : $a;
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
    		array_push( $ar, new ConsignacionProducto($foo));
		}
		return $ar;
	}


	/**
	  *	Eliminar registros.
	  *	
	  * Este metodo eliminara la informacion de base de datos identificados por la clave primaria
	  * en el objeto ConsignacionProducto suministrado. Una vez que se ha suprimido un objeto, este no 
	  * puede ser restaurado llamando a save(). save() al ver que este es un objeto vacio, creara una nueva fila 
	  * pero el objeto resultante tendra una clave primaria diferente de la que estaba en el objeto eliminado. 
	  * Si no puede encontrar eliminar fila coincidente a eliminar, Exception sera lanzada.
	  *	
	  *	@throws Exception Se arroja cuando el objeto no tiene definidas sus llaves primarias.
	  *	@return int El numero de filas afectadas.
	  * @param ConsignacionProducto [$consignacion_producto] El objeto de tipo ConsignacionProducto a eliminar
	  **/
	public static final function delete( &$consignacion_producto )
	{
		if(self::getByPK($consignacion_producto->getIdConsignacion(), $consignacion_producto->getIdProducto()) === NULL) throw new Exception('Campo no encontrado.');
		$sql = "DELETE FROM consignacion_producto WHERE  id_consignacion = ? AND id_producto = ?;";
		$params = array( $consignacion_producto->getIdConsignacion(), $consignacion_producto->getIdProducto() );
		global $conn;

		$conn->Execute($sql, $params);
		return $conn->Affected_Rows();
	}


}
