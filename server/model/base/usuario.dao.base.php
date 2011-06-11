<?php
/** Usuario Data Access Object (DAO) Base.
  * 
  * Esta clase contiene toda la manipulacion de bases de datos que se necesita para 
  * almacenar de forma permanente y recuperar instancias de objetos {@link Usuario }. 
  * @author no author especified
  * @access private
  * @abstract
  * @package docs
  * 
  */
abstract class UsuarioDAOBase extends DAO
{

		private static $loadedRecords = array();

		private static function recordExists(  $id_usuario ){
			$pk = "";
			$pk .= $id_usuario . "-";
			return array_key_exists ( $pk , self::$loadedRecords );
		}
		private static function pushRecord( $inventario,  $id_usuario){
			$pk = "";
			$pk .= $id_usuario . "-";
			self::$loadedRecords [$pk] = $inventario;
		}
		private static function getRecord(  $id_usuario ){
			$pk = "";
			$pk .= $id_usuario . "-";
			return self::$loadedRecords[$pk];
		}
	/**
	  *	Guardar registros. 
	  *	
	  *	Este metodo guarda el estado actual del objeto {@link Usuario} pasado en la base de datos. La llave 
	  *	primaria indicara que instancia va a ser actualizado en base de datos. Si la llave primara o combinacion de llaves
	  *	primarias describen una fila que no se encuentra en la base de datos, entonces save() creara una nueva fila, insertando
	  *	en ese objeto el ID recien creado.
	  *	
	  *	@static
	  * @throws Exception si la operacion fallo.
	  * @param Usuario [$usuario] El objeto de tipo Usuario
	  * @return Un entero mayor o igual a cero denotando las filas afectadas.
	  **/
	public static final function save( &$usuario )
	{
		if(  self::getByPK(  $usuario->getIdUsuario() ) !== NULL )
		{
			try{ return UsuarioDAOBase::update( $usuario) ; } catch(Exception $e){ throw $e; }
		}else{
			try{ return UsuarioDAOBase::create( $usuario) ; } catch(Exception $e){ throw $e; }
		}
	}


	/**
	  *	Obtener {@link Usuario} por llave primaria. 
	  *	
	  * Este metodo cargara un objeto {@link Usuario} de la base de datos 
	  * usando sus llaves primarias. 
	  *	
	  *	@static
	  * @return @link Usuario Un objeto del tipo {@link Usuario}. NULL si no hay tal registro.
	  **/
	public static final function getByPK(  $id_usuario )
	{
		if(self::recordExists(  $id_usuario)){
			return self::getRecord( $id_usuario );
		}
		$sql = "SELECT * FROM usuario WHERE (id_usuario = ? ) LIMIT 1;";
		$params = array(  $id_usuario );
		global $conn;
		$rs = $conn->GetRow($sql, $params);
		if(count($rs)==0)return NULL;
			$foo = new Usuario( $rs );
			self::pushRecord( $foo,  $id_usuario );
			return $foo;
	}


	/**
	  *	Obtener todas las filas.
	  *	
	  * Esta funcion leera todos los contenidos de la tabla en la base de datos y construira
	  * un vector que contiene objetos de tipo {@link Usuario}. Tenga en cuenta que este metodo
	  * consumen enormes cantidades de recursos si la tabla tiene muchas filas. 
	  * Este metodo solo debe usarse cuando las tablas destino tienen solo pequenas cantidades de datos o se usan sus parametros para obtener un menor numero de filas.
	  *	
	  *	@static
	  * @param $pagina Pagina a ver.
	  * @param $columnas_por_pagina Columnas por pagina.
	  * @param $orden Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $tipo_de_orden 'ASC' o 'DESC' el default es 'ASC'
	  * @return Array Un arreglo que contiene objetos del tipo {@link Usuario}.
	  **/
	public static final function getAll( $pagina = NULL, $columnas_por_pagina = NULL, $orden = NULL, $tipo_de_orden = 'ASC' )
	{
		$sql = "SELECT * from usuario";
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
			$bar = new Usuario($foo);
    		array_push( $allData, $bar);
			//id_usuario
    		self::pushRecord( $bar, $foo["id_usuario"] );
		}
		return $allData;
	}


	/**
	  *	Buscar registros.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link Usuario} de la base de datos. 
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
	  * @param Usuario [$usuario] El objeto de tipo Usuario
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function search( $usuario , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from usuario WHERE ("; 
		$val = array();
		if( $usuario->getIdUsuario() != NULL){
			$sql .= " id_usuario = ? AND";
			array_push( $val, $usuario->getIdUsuario() );
		}

		if( $usuario->getRFC() != NULL){
			$sql .= " RFC = ? AND";
			array_push( $val, $usuario->getRFC() );
		}

		if( $usuario->getNombre() != NULL){
			$sql .= " nombre = ? AND";
			array_push( $val, $usuario->getNombre() );
		}

		if( $usuario->getContrasena() != NULL){
			$sql .= " contrasena = ? AND";
			array_push( $val, $usuario->getContrasena() );
		}

		if( $usuario->getIdSucursal() != NULL){
			$sql .= " id_sucursal = ? AND";
			array_push( $val, $usuario->getIdSucursal() );
		}

		if( $usuario->getActivo() != NULL){
			$sql .= " activo = ? AND";
			array_push( $val, $usuario->getActivo() );
		}

		if( $usuario->getFingerToken() != NULL){
			$sql .= " finger_token = ? AND";
			array_push( $val, $usuario->getFingerToken() );
		}

		if( $usuario->getSalario() != NULL){
			$sql .= " salario = ? AND";
			array_push( $val, $usuario->getSalario() );
		}

		if( $usuario->getDireccion() != NULL){
			$sql .= " direccion = ? AND";
			array_push( $val, $usuario->getDireccion() );
		}

		if( $usuario->getTelefono() != NULL){
			$sql .= " telefono = ? AND";
			array_push( $val, $usuario->getTelefono() );
		}

		if( $usuario->getUltimoAcceso() != NULL){
			$sql .= " ultimo_acceso = ? AND";
			array_push( $val, $usuario->getUltimoAcceso() );
		}

		if( $usuario->getOnline() != NULL){
			$sql .= " online = ? AND";
			array_push( $val, $usuario->getOnline() );
		}

		if( $usuario->getFechaInicio() != NULL){
			$sql .= " fecha_inicio = ? AND";
			array_push( $val, $usuario->getFechaInicio() );
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
			$bar =  new Usuario($foo);
    		array_push( $ar,$bar);
    		self::pushRecord( $bar, $foo["id_usuario"] );
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
	  * @param Usuario [$usuario] El objeto de tipo Usuario a actualizar.
	  **/
	private static final function update( $usuario )
	{
		$sql = "UPDATE usuario SET  RFC = ?, nombre = ?, contrasena = ?, id_sucursal = ?, activo = ?, finger_token = ?, salario = ?, direccion = ?, telefono = ?, ultimo_acceso = ?, online = ?, fecha_inicio = ? WHERE  id_usuario = ?;";
		$params = array( 
			$usuario->getRFC(), 
			$usuario->getNombre(), 
			$usuario->getContrasena(), 
			$usuario->getIdSucursal(), 
			$usuario->getActivo(), 
			$usuario->getFingerToken(), 
			$usuario->getSalario(), 
			$usuario->getDireccion(), 
			$usuario->getTelefono(), 
			$usuario->getUltimoAcceso(), 
			$usuario->getOnline(), 
			$usuario->getFechaInicio(), 
			$usuario->getIdUsuario(), );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		return $conn->Affected_Rows();
	}


	/**
	  *	Crear registros.
	  *	
	  * Este metodo creara una nueva fila en la base de datos de acuerdo con los 
	  * contenidos del objeto Usuario suministrado. Asegurese
	  * de que los valores para todas las columnas NOT NULL se ha especificado 
	  * correctamente. Despues del comando INSERT, este metodo asignara la clave 
	  * primaria generada en el objeto Usuario dentro de la misma transaccion.
	  *	
	  * @internal private information for advanced developers only
	  * @return Un entero mayor o igual a cero identificando las filas afectadas, en caso de error, regresara una cadena con la descripcion del error
	  * @param Usuario [$usuario] El objeto de tipo Usuario a crear.
	  **/
	private static final function create( &$usuario )
	{
		$sql = "INSERT INTO usuario ( id_usuario, RFC, nombre, contrasena, id_sucursal, activo, finger_token, salario, direccion, telefono, ultimo_acceso, online, fecha_inicio ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
		$params = array( 
			$usuario->getIdUsuario(), 
			$usuario->getRFC(), 
			$usuario->getNombre(), 
			$usuario->getContrasena(), 
			$usuario->getIdSucursal(), 
			$usuario->getActivo(), 
			$usuario->getFingerToken(), 
			$usuario->getSalario(), 
			$usuario->getDireccion(), 
			$usuario->getTelefono(), 
			$usuario->getUltimoAcceso(), 
			$usuario->getOnline(), 
			$usuario->getFechaInicio(), 
		 );
		global $conn;
		try{$conn->Execute($sql, $params);}
		catch(Exception $e){ throw new Exception ($e->getMessage()); }
		$ar = $conn->Affected_Rows();
		if($ar == 0) return 0;
		 $usuario->setIdUsuario( $conn->Insert_ID() );
		return $ar;
	}


	/**
	  *	Buscar por rango.
	  *	
	  * Este metodo proporciona capacidad de busqueda para conseguir un juego de objetos {@link Usuario} de la base de datos siempre y cuando 
	  * esten dentro del rango de atributos activos de dos objetos criterio de tipo {@link Usuario}.
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
	  * @param Usuario [$usuario] El objeto de tipo Usuario
	  * @param Usuario [$usuario] El objeto de tipo Usuario
	  * @param $orderBy Debe ser una cadena con el nombre de una columna en la base de datos.
	  * @param $orden 'ASC' o 'DESC' el default es 'ASC'
	  **/
	public static final function byRange( $usuarioA , $usuarioB , $orderBy = null, $orden = 'ASC')
	{
		$sql = "SELECT * from usuario WHERE ("; 
		$val = array();
		if( (($a = $usuarioA->getIdUsuario()) != NULL) & ( ($b = $usuarioB->getIdUsuario()) != NULL) ){
				$sql .= " id_usuario >= ? AND id_usuario <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " id_usuario = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getRFC()) != NULL) & ( ($b = $usuarioB->getRFC()) != NULL) ){
				$sql .= " RFC >= ? AND RFC <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " RFC = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getNombre()) != NULL) & ( ($b = $usuarioB->getNombre()) != NULL) ){
				$sql .= " nombre >= ? AND nombre <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " nombre = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getContrasena()) != NULL) & ( ($b = $usuarioB->getContrasena()) != NULL) ){
				$sql .= " contrasena >= ? AND contrasena <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " contrasena = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getIdSucursal()) != NULL) & ( ($b = $usuarioB->getIdSucursal()) != NULL) ){
				$sql .= " id_sucursal >= ? AND id_sucursal <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " id_sucursal = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getActivo()) != NULL) & ( ($b = $usuarioB->getActivo()) != NULL) ){
				$sql .= " activo >= ? AND activo <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " activo = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getFingerToken()) != NULL) & ( ($b = $usuarioB->getFingerToken()) != NULL) ){
				$sql .= " finger_token >= ? AND finger_token <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " finger_token = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getSalario()) != NULL) & ( ($b = $usuarioB->getSalario()) != NULL) ){
				$sql .= " salario >= ? AND salario <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " salario = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getDireccion()) != NULL) & ( ($b = $usuarioB->getDireccion()) != NULL) ){
				$sql .= " direccion >= ? AND direccion <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " direccion = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getTelefono()) != NULL) & ( ($b = $usuarioB->getTelefono()) != NULL) ){
				$sql .= " telefono >= ? AND telefono <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " telefono = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getUltimoAcceso()) != NULL) & ( ($b = $usuarioB->getUltimoAcceso()) != NULL) ){
				$sql .= " ultimo_acceso >= ? AND ultimo_acceso <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " ultimo_acceso = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getOnline()) != NULL) & ( ($b = $usuarioB->getOnline()) != NULL) ){
				$sql .= " online >= ? AND online <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " online = ? AND"; 
			$a = $a == NULL ? $b : $a;
			array_push( $val, $a);
			
		}

		if( (($a = $usuarioA->getFechaInicio()) != NULL) & ( ($b = $usuarioB->getFechaInicio()) != NULL) ){
				$sql .= " fecha_inicio >= ? AND fecha_inicio <= ? AND";
				array_push( $val, min($a,$b)); 
				array_push( $val, max($a,$b)); 
		}elseif( $a || $b ){
			$sql .= " fecha_inicio = ? AND"; 
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
    		array_push( $ar, new Usuario($foo));
		}
		return $ar;
	}


	/**
	  *	Eliminar registros.
	  *	
	  * Este metodo eliminara la informacion de base de datos identificados por la clave primaria
	  * en el objeto Usuario suministrado. Una vez que se ha suprimido un objeto, este no 
	  * puede ser restaurado llamando a save(). save() al ver que este es un objeto vacio, creara una nueva fila 
	  * pero el objeto resultante tendra una clave primaria diferente de la que estaba en el objeto eliminado. 
	  * Si no puede encontrar eliminar fila coincidente a eliminar, Exception sera lanzada.
	  *	
	  *	@throws Exception Se arroja cuando el objeto no tiene definidas sus llaves primarias.
	  *	@return int El numero de filas afectadas.
	  * @param Usuario [$usuario] El objeto de tipo Usuario a eliminar
	  **/
	public static final function delete( &$usuario )
	{
		if(self::getByPK($usuario->getIdUsuario()) === NULL) throw new Exception('Campo no encontrado.');
		$sql = "DELETE FROM usuario WHERE  id_usuario = ?;";
		$params = array( $usuario->getIdUsuario() );
		global $conn;

		$conn->Execute($sql, $params);
		return $conn->Affected_Rows();
	}


}
