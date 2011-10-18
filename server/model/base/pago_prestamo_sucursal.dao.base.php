<?php
/** PagoPrestamoSucursal Data Access Object (DAO) Base.
  * 
  * Esta clase contiene toda la manipulacion de bases de datos que se necesita para 
  * almacenar de forma permanente y recuperar instancias de objetos {@link PagoPrestamoSucursal }. 
  * @author caffeina
  * @access private
  * @abstract
  * @package docs
  * 
  */
abstract class PagoPrestamoSucursalDAOBase extends DAO
{

		private static $loadedRecords = array();

		private static function recordExists(  $id_pago ){
			$pk = "";
			$pk .= $id_pago . "-";
			return array_key_exists ( $pk , self::$loadedRecords );
		}
		private static function pushRecord( $inventario,  $id_pago){
			$pk = "";
			$pk .= $id_pago . "-";
			self::$loadedRecords [$pk] = $inventario;
		}
		private static function getRecord(  $id_pago ){
			$pk = "";
			$pk .= $id_pago . "-";
			return self::$loadedRecords[$pk];
		}
	/**
	  *	Guardar registros. 
	  *	
	  *	Este metodo guarda el estado actual del objeto {@link PagoPrestamoSucursal} pasado en la base de datos. La llave 
	  *	primaria indicara que instancia va a ser actualizado en base de datos. Si la llave primara o combinacion de llaves
	  *	primarias describen una fila que no se encuentra en la base de datos, entonces save() creara una nueva fila, insertando
	  *	en ese objeto el ID recien creado.
	  *	
	  *	@static
	  * @throws Exception si la operacion fallo.
	  * @param PagoPrestamoSucursal [$pago_prestamo_sucursal] El objeto de tipo PagoPrestamoSucursal
	  * @return Un entero mayor o igual a cero denotando las filas afectadas.
	  **/
	public static final function save( &$pago_prestamo_sucursal )
	{
		if(  self::getByPK(  $pago_prestamo_sucursal->getIdPago() ) !== NULL )
		{
			try{ return PagoPrestamoSucursalDAOBase::update( $pago_prestamo_sucursal) ; } catch(Exception $e){ throw $e; }
		}else{
			try{ return PagoPrestamoSucursalDAOBase::create( $pago_prestamo_sucursal) ; } catch(Exception $e){ throw $e; }
		}
	}


	/**
	  *	Obtener {@link PagoPrestamoSucursal} por llave primaria. 
	  *	
	  * Este metodo cargara un objeto {@link PagoPrestamoSucursal} de la base de datos 
	  * usando sus llaves primarias. 
	  *	
	  *	@static
	  * @return @link PagoPrestamoSucursal Un objeto del tipo {@link PagoPrestamoSucursal}. NULL si no hay tal registro.
	  **/
	public static final function getByPK(  $id_pago )
	{
		if(self::recordExists(  $id_pago)){
			return self::getRecord( $id_pago );
		}
		$sql = "SELECT * FROM pago_prestamo_sucursal WHERE (id_pago = ? ) LIMIT 1;";
		$params = array(  $id_pago );
		global $conn;
		$rs = $conn->GetRow($sql, $params);
		if(count($rs)==0)return NULL;
			$foo = new PagoPrestamoSucursal( $rs );
			self::pushRecord( $foo,  $id_pago );
			return $foo;
	}


	/**
	  *	Obtener todas las filas.
	  *	
	  * Esta funcion leera todos los contenidos de la tabla en la base de datos y construira
	  * un vector que contiene objetos de tipo {@link PagoPrestamoSucursal}. Tenga en cuenta que este metodo
	  * consumen enormes cantidades de recursos si la tabla tiene muchas filas. 
	  * Este metodo solo debe usarse cuando las tablas destino tienen solo pequenas cantidades de datos o se usan sus parametros para obtener un menor numero de filas.
	  *	
	  *	@static
	  * @param $pagina Pagina a ver.
	  * @param $columnas_por_pagina Columnas por pagina.
	  * @param $orden Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $tipo_de_orden 'ASC' o 'DESC' el default es 'ASC'
	  * @return Array Un arreglo que contiene objetos del tipo {@link PagoPrestamoSucursal}.
	  **/
	public static final function getAll( $pagina = NULL, $columnas_por_pagina = NULL, $orden = NULL, $tipo_de_orden = 'ASC' )
	{
		$sql = "SELECT * from pago_prestamo_sucursal";
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
			$bar = new PagoPrestamoSucursal($foo);
    		array_push( $allData, $bar);
			//id_pago
    		self::pushRecord( $bar, $foo["id_pago"] );
		}
		return $allData;
	}


	/**
	  *	Buscar registros.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link PagoPrestamoSucursal} de la base de datos. 
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
	  * @param PagoPrestamoSucursal [$pago_prestamo_sucursal] El objeto de tipo PagoPrestamoSucursal
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function search( $pago_prestamo_sucursal , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from pago_prestamo_sucursal WHERE ("; 
		$val = array();
		if( $pago_prestamo_sucursal->getIdPago() != NULL){
			$sql .= " id_pago = ? AND";
			array_push( $val, $pago_prestamo_sucursal->getIdPago() );
		}

		if( $pago_prestamo_sucursal->getIdPrestamo() != NULL){
			$sql .= " id_prestamo = ? AND";
			array_push( $val, $pago_prestamo_sucursal->getIdPrestamo() );
		}

		if( $pago_prestamo_sucursal->getIdUsuario() != NULL){
			$sql .= " id_usuario = ? AND";
			array_push( $val, $pago_prestamo_sucursal->getIdUsuario() );
		}

		if( $pago_prestamo_sucursal->getFecha() != NULL){
			$sql .= " fecha = ? AND";
			array_push( $val, $pago_prestamo_sucursal->getFecha() );
		}

		if( $pago_prestamo_sucursal->getMonto() != NULL){
			$sql .= " monto = ? AND";
			array_push( $val, $pago_prestamo_sucursal->getMonto() );
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
			$bar =  new PagoPrestamoSucursal($foo);
    		array_push( $ar,$bar);
    		self::pushRecord( $bar, $foo["id_pago"] );
		}
		return $ar;
	}


	/**
	  *	Actualizar registros.
	  *	
	  * Este metodo es un metodo de ayuda para uso interno. Se ejecutara todas las manipulaciones
	  * en la base de datos que estan dadas en el objeto pasado.No se haran consultas SELECT 
	  * aqui, sin embargo. El valor de retorno indica cuántas filas se vieron afectadas.
	  *	
	  * @internal private information for advanced developers only
	  * @return Filas afectadas o un string con la descripcion del error
	  * @param PagoPrestamoSucursal [$pago_prestamo_sucursal] El objeto de tipo PagoPrestamoSucursal a actualizar.
	  **/
	private static final function update( $pago_prestamo_sucursal )
	{
		$sql = "UPDATE pago_prestamo_sucursal SET  id_prestamo = ?, id_usuario = ?, fecha = ?, monto = ? WHERE  id_pago = ?;";
		$params = array( 
			$pago_prestamo_sucursal->getIdPrestamo(), 
			$pago_prestamo_sucursal->getIdUsuario(), 
			$pago_prestamo_sucursal->getFecha(), 
			$pago_prestamo_sucursal->getMonto(), 
			$pago_prestamo_sucursal->getIdPago(), );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		return $conn->Affected_Rows();
	}


	/**
	  *	Crear registros.
	  *	
	  * Este metodo creara una nueva fila en la base de datos de acuerdo con los 
	  * contenidos del objeto PagoPrestamoSucursal suministrado. Asegurese
	  * de que los valores para todas las columnas NOT NULL se ha especificado 
	  * correctamente. Despues del comando INSERT, este metodo asignara la clave 
	  * primaria generada en el objeto PagoPrestamoSucursal dentro de la misma transaccion.
	  *	
	  * @internal private information for advanced developers only
	  * @return Un entero mayor o igual a cero identificando las filas afectadas, en caso de error, regresara una cadena con la descripcion del error
	  * @param PagoPrestamoSucursal [$pago_prestamo_sucursal] El objeto de tipo PagoPrestamoSucursal a crear.
	  **/
	private static final function create( &$pago_prestamo_sucursal )
	{
		$sql = "INSERT INTO pago_prestamo_sucursal ( id_pago, id_prestamo, id_usuario, fecha, monto ) VALUES ( ?, ?, ?, ?, ?);";
		$params = array( 
			$pago_prestamo_sucursal->getIdPago(), 
			$pago_prestamo_sucursal->getIdPrestamo(), 
			$pago_prestamo_sucursal->getIdUsuario(), 
			$pago_prestamo_sucursal->getFecha(), 
			$pago_prestamo_sucursal->getMonto(), 
		 );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		$ar = $conn->Affected_Rows();
		if($ar == 0) return 0;
		/* save autoincremented value on obj */  $pago_prestamo_sucursal->setIdPago( $conn->Insert_ID() ); /*  */ 
		return $ar;
	}


	/**
	  *	Buscar por rango.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link PagoPrestamoSucursal} de la base de datos siempre y cuando 
	  * esten dentro del rango de atributos activos de dos objetos criterio de tipo {@link PagoPrestamoSucursal}.
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
	  * @param PagoPrestamoSucursal [$pago_prestamo_sucursal] El objeto de tipo PagoPrestamoSucursal
	  * @param PagoPrestamoSucursal [$pago_prestamo_sucursal] El objeto de tipo PagoPrestamoSucursal
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function byRange( $pago_prestamo_sucursalA , $pago_prestamo_sucursalB , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from pago_prestamo_sucursal WHERE ("; 
		$val = array();
		if( (($a = $pago_prestamo_sucursalA->getIdPago()) != NULL) & ( ($b = $pago_prestamo_sucursalB->getIdPago()) != NULL) ){
				$sql .= " id_pago >= ? AND id_pago <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " id_pago = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $pago_prestamo_sucursalA->getIdPrestamo()) != NULL) & ( ($b = $pago_prestamo_sucursalB->getIdPrestamo()) != NULL) ){
				$sql .= " id_prestamo >= ? AND id_prestamo <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " id_prestamo = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $pago_prestamo_sucursalA->getIdUsuario()) != NULL) & ( ($b = $pago_prestamo_sucursalB->getIdUsuario()) != NULL) ){
				$sql .= " id_usuario >= ? AND id_usuario <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " id_usuario = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $pago_prestamo_sucursalA->getFecha()) != NULL) & ( ($b = $pago_prestamo_sucursalB->getFecha()) != NULL) ){
				$sql .= " fecha >= ? AND fecha <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " fecha = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $pago_prestamo_sucursalA->getMonto()) != NULL) & ( ($b = $pago_prestamo_sucursalB->getMonto()) != NULL) ){
				$sql .= " monto >= ? AND monto <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " monto = ? AND"; 
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
    		array_push( $ar, new PagoPrestamoSucursal($foo));
		}
		return $ar;
	}


	/**
	  *	Eliminar registros.
	  *	
	  * Este metodo eliminara la informacion de base de datos identificados por la clave primaria
	  * en el objeto PagoPrestamoSucursal suministrado. Una vez que se ha suprimido un objeto, este no 
	  * puede ser restaurado llamando a save(). save() al ver que este es un objeto vacio, creara una nueva fila 
	  * pero el objeto resultante tendra una clave primaria diferente de la que estaba en el objeto eliminado. 
	  * Si no puede encontrar eliminar fila coincidente a eliminar, Exception sera lanzada.
	  *	
	  *	@throws Exception Se arroja cuando el objeto no tiene definidas sus llaves primarias.
	  *	@return int El numero de filas afectadas.
	  * @param PagoPrestamoSucursal [$pago_prestamo_sucursal] El objeto de tipo PagoPrestamoSucursal a eliminar
	  **/
	public static final function delete( &$pago_prestamo_sucursal )
	{
		if(self::getByPK($pago_prestamo_sucursal->getIdPago()) === NULL) throw new Exception('Campo no encontrado.');
		$sql = "DELETE FROM pago_prestamo_sucursal WHERE  id_pago = ?;";
		$params = array( $pago_prestamo_sucursal->getIdPago() );
		global $conn;

		$conn->Execute($sql, $params);
		return $conn->Affected_Rows();
	}


}