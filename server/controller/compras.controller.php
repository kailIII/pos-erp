 <?php 

require_once('model/inventario.dao.php');
require_once('model/compra_proveedor.dao.php');
require_once('model/detalle_compra_proveedor.dao.php');
require_once('model/compra_sucursal.dao.php');
require_once('model/detalle_compra_sucursal.dao.php');
require_once('model/compra_proveedor_flete.dao.php');
require_once('model/inventario_maestro.dao.php');
require_once('model/autorizacion.dao.php');

require_once('logger.php');


function nuevaCompraProveedor( $data = null ){

	$data = parseJSON( $data );

	//{"embarque" : {"id_proveedor":1,"folio": "456","merma_por_arpilla": 0,"numero_de_viaje": null,"peso_por_arpilla": 55.45,"peso_origen" : 12345,"peso_recibido" : 12345,"productor" : "Jorge Nolasco","importe_total": 3702,"total_arpillas": 1,"costo_flete" : 123 },"conductor" : {"nombre_chofer" : "Alan Gonzalez","placas" : "afsdf67t78","marca_camion" : "Chrysler","modelo_camion" : "1977" },"productos": [{"id_producto": 3,"variedad" : "fianas","arpillas" : 12,"precio_kg" : 5.35,"sitio_descarga" : 0}]}

	if( !( isset( $data -> embarque ) && isset( $data -> conductor ) && isset( $data -> productos ) ) ){
		Logger::log("Json invalido para crear nueva compra proveedor:");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	if( $data -> embarque == null ||  $data -> conductor == null || $data -> productos == null){
		Logger::log("Json invalido para crear nueva compra proveedor:");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	
	/*
	
		{
		"embarque" : {
			"id_proveedor": 1,
			"folio": "456",
			"merma_por_arpilla": 0,
			"numero_de_viaje": null,
			"peso_por_arpilla": 55.45,
			"peso_origen" : 12345,
			"peso_recibido" : 12345,
			"productor" : "Jorge Nolasco",
			"importe_total": 3702,
			"total_arpillas": 1,
			"costo_flete" : 123 
		},
		"conductor" : {
			"nombre_chofer" : "Alan Gonzalez",
			"placas" : "afsdf67t78",
			"marca_camion" : "Chrysler",
			"modelo_camion" : "1977" 
		},
		"productos": [
			{
				"id_producto": 3,
				"variedad" : "fianas",
				"arpillas" : 12,
				"precio_kg" : 5.35,
				"sitio_descarga" : 0
			}
		]
	}
	
	//todos nulos
	{"embarque" : {"id_proveedor": null,"folio": null,"merma_por_arpilla": null,"numero_de_viaje": null,"peso_por_arpilla": null,"peso_origen" : null,"peso_recibido" : null,"productor" : null,"importe_total": null,"total_arpillas": null,"costo_flete" : null },"conductor" : {"nombre_chofer" : null,"placas" : null,"marca_camion" : null,"modelo_camion" : null },"productos": [{"id_producto": null,"variedad" : null,"arpillas" : null,"precio_kg" : null,"sitio_descarga" : null}]}
	
	*/
	
	
	Logger::log("Iniciando le proceso de registro de nueva compra a proveedor");
	
	//creamos la compra al proveedor
	$id_compra_proveedor = compraProveedor( $data->embarque, $data->productos );
	
	//damos de alta el flete
	compraProveedorFlete($data->conductor, $id_compra_proveedor, $data->embarque->costo_flete);
	
	//damos de alta el detalle de la compra al proveedor
	ingresarDetalleCompraProveedor( $data->productos, $id_compra_proveedor, $data->embarque->peso_por_arpilla);
	
	//isertamos en el inventario maestro
	//($data = null, $id_compra_proveedor = null, $peso_por_arpilla = null, $sitio_descarga = null){
	insertarProductoInventarioMaestro($data->productos, $id_compra_proveedor, $data->embarque->peso_por_arpilla);
	
	
}

function compraProveedor( $data = null, $productos = null ){

	/*if($json == null){
        Logger::log("No hay parametros para ingresar nueva compra a proveedor.");
		die('{ "success": false, "reason" : "Parametros invalidos" }');
	}

	$data = parseJSON( $json );*/
	
	/*
	
	
	NOTA: FATA PESO ORIGEN EN LA BD
	
	*/
	
	if($data == null){
		Logger::log("Json invalido para crear nueva compra proveedor:");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	/*
	
	"embarque" : {
		"id_proveedor": 1,
		"folio": "456",
		"merma_por_arpilla": 0,
		"numero_de_viaje": null,
		"peso_por_arpilla": 55.45,
		"peso_origen" : 12345,
		"peso_recibido" : 12345,
		"productor" : "Jorge Nolasco",
		"importe_total": 3702,
		"total_arpillas": 1,
		"costo_flete" : 123 
	}
	
	*/
	
	if(!(   isset($data->id_proveedor) &&
			isset($data->merma_por_arpilla) &&
			isset($data->peso_origen) &&
			isset($data->peso_recibido) &&
			isset($data->productor) &&
			isset($data->total_arpillas) &&
			isset($data->peso_por_arpilla) 
		)){
		Logger::log("Faltan parametros para crear la compra a proveedor");
		die('{ "success": false, "reason" : "Parametros invalidos." }');

	}
	
	//calculamos cuanto vale el viaje segun el proveedor
	/*$peso_promedio_origen = ( $data->peso_origen / $data->total_arpillas );
	$precio_total_origen = 0;
	
	foreach( $productos as $producto ){
		$precio_total_origen += $producto->precio_kg * $peso_promedio_origen;
	}*/

	//creamos el objeto compra
    $compra = new CompraProveedor();
	
	$compra -> setIdProveedor( $data->id_proveedor );	
	
	$compra -> setPesoOrigen( $data->peso_origen );
	
	if(isset($data->folio))
		$compra -> setFolio( $data->folio );
	
	if(isset($data->numero_de_viaje))
		$compra -> setNumeroDeViaje( $data->numero_de_viaje );
	
	$compra -> setPesoRecibido( $data->peso_recibido );
	
	$compra -> setArpillas( $data->total_arpillas );
	
	$compra -> setPesoPorArpilla( $data->peso_por_arpilla );
	
	$compra -> setProductor( $data->productor );
	
	if(isset($data->calidad))
		$compra -> setCalidad( $data->calidad );
	
    $compra -> setMermaPorArpilla( $data->merma_por_arpilla );
	
	if(isset($data->importe_total))
		$compra -> setTotalOrigen( $precio_total_origen );
	
	DAO::transBegin();	
	
	try{
		CompraProveedorDAO::save( $compra );
	}catch(Exception $e){
        Logger::log("Error al guardar la nueva compra a proveedor:" . $e);
		DAO::transRollback();	
	    die( '{"success": false, "reason": "Error al guardar la compra" }' );
	}

	Logger::log("Compra a proveedor creada !");
	
	return $compra -> getIdCompraProveedor();
	
    //printf('{"success": true, "id": "%s"}' , $compra->getIdCompraProveedor());
	

}

function compraProveedorFlete( $data = null, $id_compra_proveedor = null, $costo_flete = null ){

	/*if($json == null){
        Logger::log("No hay parametros para ingresar nuevo flete a compra a proveedor.");
		die('{ "success": false, "reason" : "Parametros invalidos" }');
	}

	$data = parseJSON( $json );*/

	if($data == null){
		Logger::log("Json invalido para crear nueva compra proveedor:");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	
	/*
	
	"conductor" : {
        "nombre_chofer" : "Alan Gonzalez",
        "placas" : "afsdf67t78",
        "marca_camion" : "Chrysler",
        "modelo_camion" : "1977" 
    }
	
	*/
	
	if(!( $id_compra_proveedor != null &&
			$costo_flete != null &&
			isset($data->nombre_chofer) &&
			isset($data->placas)
		)){
		Logger::log("Faltan parametros para crear el nuevo flete a compra a proveedor:" . $json);
		die('{ "success": false, "reason" : "Faltan parametros." }');

	}

    $compra = new CompraProveedorFlete();
	
	$compra -> setIdCompraProveedor( $id_compra_proveedor );
	
	$compra -> setChofer( $data->nombre_chofer );
	
	if( isset( $data->marca_camion ) )
		$compra -> setMarcaCamion( $data->marca_camion );
		
	$compra -> setPlacasCamion( $data->placas );
	
	if( isset( $data->modelo_camion ) )
	$compra -> setModeloCamion( $data->modelo_camion );
	
	$compra -> setCostoFlete( $costo_flete );	
	
	try{
		CompraProveedorFleteDAO::save( $compra );
	}catch(Exception $e){
        Logger::log("Error al guardar el nuevo flete a compra a proveedor:" . $e);
		DAO::transRollback();
	    die( '{"success": false, "reason": "Error al guardar el flete" }' );
	}

	Logger::log("Flete a compra a proveedor creado !");
	
    //printf('{"success": true}');
	return;

}


function editarCompraProveedor( $json ){

	if($json == null){
        Logger::log("No hay parametros para editar la compra a proveedor.");
		die('{ "success": false, "reason" : "Parametros invalidos" }');
	}

	$data = parseJSON( $json );

	if($data == null){
		Logger::log("Json invalido para crear editar la compra a proveedor:" . $json);
		die('{ "success": false, "reason" : "Parametros invalidos" }');
	}	
	
	if( !isset( $data->id_compra_proveedor ) ){
		Logger::log("No se ha especificado que compra a proveedor se desea editar");
		die('{ "success": false, "reason" : "Parametros invalidos" }');
	}

    $compra = new CompraProveedor( );
	
	$compra -> setIdCompraProveedor( $data->id_compra_proveedor );
	
	if( isset( $data->id_proveedor ) )
		$compra -> setIdProveedor( $data->id_proveedor );
		
	if( isset( $data->folio ) )
		$compra -> setFolio( $data->folio );
		
	if( isset( $data->numero_de_viaje ) )
		$compra -> setNumeroDeViaje( $data->numero_de_viaje );
		
	if( isset( $data->peso_recibido ) )
		$compra -> setPesoRecibido( $data->peso_recibido );
		
	if( isset( $data->arpillas ) )
		$compra -> setArpillas( $data->arpillas );
		
	if( isset( $data->peso_por_arpilla ) )
		$compra -> setPesoPorArpilla( $data->peso_por_arpilla );
				
		
	if( isset( $data->merma_por_arpilla ) )
		$compra -> setMermaPorArpilla( $data->merma_por_arpilla );
	
	if( isset( $data->productor ) )
		$compra -> setProductor( $data->productor );
	
	if( isset( $data->total_origen ) )
		$compra -> setTotalOrigen( $data->total_origen );
		
	try{
		CompraProveedorDAO::save( $compra );
	}catch(Exception $e){
        Logger::log("Error al guardar la edicion de la compra a proveedor:" . $e);
	    die( '{"success": false, "reason": "Error" }' );
	}

    printf('{"success": true, "id": "%s"}' , $compra->getIdCompraProveedor());
	Logger::log("Compra a proveedor modificada !");

}

function detalleCompraProveedor( $id_compra ){

    if( !isset( $id_compra ) )
    {
		Logger::log("Error : no se especifico el id_compra");
        die('{"success": false, "reason": "No hay parametros para ingresar." }');
    }
    elseif( empty( $id_compra ) )
    {
		Logger::log("Error : el id_compra esta vacio");
        die('{"success": false, "reason": "Verifique los datos." }');
    }

    //verificamos que exista esa compra
    if( !( $compra = CompraProveedorDAO::getByPK( $id_compra ) ) )
    {
		Logger::log("Error : no se tiene registro de la compra a proveedor " . $id_compra);
        die('{"success": false, "reason": "No se tiene registro de esa compra a proveedor." }');
    }

    $q = new DetalleCompraProveedor();
    $q->setIdCompraProveedor( $id_compra );
    
    $detalle_compra = DetalleCompraProveedorDAO::search( $q );
    
    $array_detalle_compra = array();
    
    foreach( $detalle_compra as $producto )
    {
    
        $productoData = InventarioMaestroDAO::getByPK( $producto -> getIdProducto(), $producto -> getIdCompraProveedor() );

        array_push( $array_detalle_compra , array(
            "id_producto" => $producto -> getIdProducto(),
            "variedad" => $producto -> getVariedad(),
			"arpillas" => $producto -> getArpillas(),
			"kg" => $producto -> getKg(),
			"precio_por_kg" => $producto -> getPrecioPorKg()
        ));
    }

    $info_compra -> id_compra_proveedor = $compra -> getIdCompraProveedor();
    //$info_compra -> total_origen = $compra -> getTotalOrigen(); //<--POR NO ESTA EN LA DOVUMENTACION?
    $info_compra -> num_compras = count( $array_detalle_compra );
    $info_compra -> articulos = $array_detalle_compra;

    return $info_compra; 

}

function listarComprasProveedor( ){
    
	return CompraProveedorDAO::getAll();
	
}



function editarCompraProveedorFlete( $json = null ){

	if($json == null){
        Logger::log("No hay parametros para modificar flete a compra a proveedor.");
		die('{ "success": false, "reason" : "Parametros invalidos" }');
	}

	$data = parseJSON( $json );

	if($data == null){
		Logger::log("Json invalido para crear un nuevo flete a compra proveedor:" . $json);
		die('{ "success": false, "reason" : "Parametros invalidos" }');
	}
	
	
	if(!( isset( $data->id_compra_proveedor) )){
		Logger::log("Faltan parametros para crear el nuevo flete a compra a proveedor:" . $json);
		die('{ "success": false, "reason" : "Faltan parametros." }');

	}

    $compra = new CompraProveedorFlete();

	$compra->setIdCompraProveedor( $data->id_compra_proveedor );
	
	if( isset( $data->id_compra_proveedor ) )
		$compra -> setIdCompraProveedor( $data->id_compra_proveedor );
		
	if( isset( $data->chofer ) )
		$compra -> setChofer( $data->chofer );
		
	if( isset( $data->marca_camion ) )
		$compra -> setMarcaCamion( $data->marca_camion );
		
	if( isset( $data->placas_camion ) )
		$compra -> setPlacasCamion( $data->placas_camion );
		
	if( isset( $data->modelo_camion ) )
		$compra -> setModeloCamion( $data->modelo_camion );
		
	if( isset( $data->costo_flete ) )
		$compra -> setCostoFlete( $data->costo_flete );	
	
	try{
		CompraProveedorFleteDAO::save( $compra );
	}catch(Exception $e){
        Logger::log("Error al guardar el nuevo flete a compra a proveedor:" . $e);
	    die( '{"success": false, "reason": "Error al guardar el flete" }' );
	}

	Logger::log("Flete a compra a proveedor creado !");
	
    printf('{"success": true}');

}

function ingresarDetalleCompraProveedor( $data = null, $id_compra_proveedor =null, $peso_por_arpilla = null ){


	if($data == null){
		Logger::log("Json invalido para crear nueva compra proveedor:");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	Logger::log("Iniciando proceso de creacion detalle compra proveedor");
	
	foreach( $data as $producto ){
		
		if( !( 
			$id_compra_proveedor != null &&
			isset( $producto -> id_producto ) && 
			isset( $producto -> variedad ) &&
			isset( $producto -> arpillas ) && 
			isset( $producto -> precio_kg ) && 			
			$peso_por_arpilla != null
			) ){
			
			Logger::log("error al agregar producto a detalle compra proveedor");
			die('{"success": false , "reason": "Parametros invalidos." }');
			DAO::transRollback();		
		}
		
		$detalle_compra_proveedor = new DetalleCompraProveedor();
	
		$detalle_compra_proveedor -> setIdCompraProveedor( $id_compra_proveedor );
		$detalle_compra_proveedor -> setIdProducto( $producto -> id_producto );
		$detalle_compra_proveedor -> setVariedad( $producto -> variedad );
		$detalle_compra_proveedor -> setArpillas( $producto -> arpillas );
		$detalle_compra_proveedor -> setKg( ( $peso_por_arpilla * $producto -> arpillas ) );
		$detalle_compra_proveedor -> setPrecioPorKg( $producto -> precio_kg );
		
		try{
			DetalleCompraProveedorDAO::save( $detalle_compra_proveedor );
		}catch(Exception $e){
			Logger::log("Error al guardar producto en detalle compra proveedor:" . $e);
			DAO::transRollback();	
			die( '{"success": false, "reason": "Error al guardar detalle compra proveedor"}' );
		}
	
	}

	Logger::log("Proceso de alta a detalle proveedor finalizado con exito!");

}

function insertarProductoInventarioMaestro($data = null, $id_compra_proveedor = null, $peso_por_arpilla = null){

	
	if($data == null){
		Logger::log("Json invalido para crear nueva compra proveedor:");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	Logger::log("Iniciando proceso de insercion de producto a inventario maestro");
		
	foreach( $data as $producto ){

		$existencias = $producto -> arpillas * $peso_por_arpilla;
	
		$inventario_maestro = new InventarioMaestro();
		
		//var_dump($producto -> sitio_descarga);
		
		$inventario_maestro -> setIdProducto( $producto->id_producto );
		$inventario_maestro -> setIdCompraProveedor( $id_compra_proveedor );
		$inventario_maestro -> setExistencias( $existencias );
		$inventario_maestro -> setExistenciasProcesadas( 0 );		
		$inventario_maestro -> setSitioDescarga( $producto -> sitio_descarga );		
		
		try{
			InventarioMaestroDAO::save( $inventario_maestro );
		}catch(Exception $e){
			Logger::log("Error al guardar producto en inventario maestro:" . $e);
			DAO::transRollback();	
			die( '{"success": false, "reason": "Error al guardar producto en inventario maestro"' . $e .'}' );
		}
	
	}
	
	DAO::transEnd();
	
	Logger::log("Proceso de alta a inventario maestro finalizado con exito!");
	
	printf('{"success": true}');
	
}

function nuevaCompraSucursal( $data = null){

	$data = parseJSON( $data );
	
	if( !( isset( $data -> sucursal ) && isset( $data -> productos ) ) ){
		Logger::log("Json invalido para crear nueva compra sucursal");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	if( $data -> sucursal == null ||  $data -> productos == null ){
		Logger::log("Json invalido para crear nueva compra sucursal");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	/*
		{
			sucursal:1,
			productos:[
				{
					id_producto:1,
					cantidad_limpia:20,
					cantidad:30,
					descuento:20,
					precio:12.4,
					id_compra:11.5
				}
			]
		}		
	*/
	
	//verificamos que exista la sucursal		
	if( !SucursalDAO::getByPK( $data->sucursal ) ){				
		Logger::log("Sucursal no encontrada, error al crear nueva compra sucursal ");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	//verificamos que contenga almenos un producto
	if( count( $data->productos ) <= 0 ){
		Logger::log("Sucursal no encontrada, error al crear nueva compra sucursal ");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	Logger::log("Inicial el proceso de compra sucursal");
	
	//mandamos los productos para editar en inventario maestro
	editarInventarioMaestro( $data -> productos );
	
	//creamos la compra sucursal
	$id_compra = compraSucursal( $data -> productos, $data -> sucursal );
	
	//agregar detalle compra sucursal
	ingresarDetalleCompraSucursal( $data -> productos, $id_compra );
	
	//agregamos la autorizacion
	ingresarAutorizacion( $data -> productos, $data -> sucursal, $id_compra );
	
}



function editarInventarioMaestro( $data = null ){
	
	if($data == null){
		Logger::log("editar inventario maestro, error : recibi objeto nulo");
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
		
	DAO::transBegin();	
	
	/*
		productos:[	
			{						
				id_producto:1,
				procesada:true,
				cantidad:30.9,
				descuento:15, //se usa hasta el detalle compra sucursal
				precio:10,
				id_compra
			}
		]
	*/

	//decontamos del inventario maestro cada producto
	foreach($data as $producto){
	
		if(!( 
			isset( $producto -> id_producto ) &&
			isset( $producto -> id_compra ) &&
			isset( $producto -> cantidad ) &&
			isset( $producto -> procesada ) 
		)){
			Logger::log("Faltan parametros para crear el nuevo flete a compra a proveedor");
			die('{ "success": false, "reason" : "Faltan parametros." }');
		}

		Logger::log("Iniciando proceso de modificacion del inventario maestro");
		
		//obtenemos el articulo del inventario maestro 
		$inventario_maestro =  InventarioMaestroDAO::getByPK( $producto -> id_producto, $producto -> id_compra );			
		
		if( $producto -> procesada )
		{

			//verificamos que lo que se va a surtir no supere a las existencias
			if( $producto -> cantidad > $inventario_maestro -> getExistenciasProcesadas() ){
				Logger::log( "Error al editar producto en inventario maestro: la cantidad requerida de producto supera las existencias" );
				DAO::transRollback();	
				die( '{"success": false, "reason": "Error al editar producto en inventario maestro"}' );
			}
		
			//aqui entra se el producto es procesado (VALIDA LAS EXISTENCIAS)
			$inventario_maestro -> setExistenciasProcesadas( $inventario_maestro -> getExistenciasProcesadas() - $producto -> cantidad );
		}
		else
		{
		
			//verificamos que lo que se va a surtir no supere a las existencias
			if( $producto -> cantidad > $inventario_maestro -> getExistencias() ){
				Logger::log( "Error al editar producto en inventario maestro: la cantidad requerida de producto supera las existencias" );
				DAO::transRollback();	
				die( '{"success": false, "reason": "Error al editar producto en inventario maestro"}' );
			}
		
			//aqui entra si el producto es original
			$inventario_maestro -> setExistencias( $inventario_maestro -> getExistencias() - $producto -> cantidad );
		}

		
		
		try{
			InventarioMaestroDAO::save( $inventario_maestro );
		}catch(Exception $e){
			Logger::log("Error al editar producto en inventario maestro:" . $e);
			DAO::transRollback();	
			die( '{"success": false, "reason": "Error al editar producto en inventario maestro"}' );
		}
	
	}
	Logger::log("Modificado el inventario maestro");
	
	return;
	
}



function compraSucursal( $data = null, $sucursal = null ){

	Logger::log("Iniciando proceso de compra sucursal");

	if($data == null || $sucursal == null){
		Logger::log("compraSucursal, error : recibi uno o mas objetos nulos");
		DAO::transRollback();
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	$subtotal_compra = 0;
	
	//calculamos el subtotal de la compra
	foreach( $data as $producto ){	
		$subtotal_compra += ( $producto -> cantidad - $producto -> descuento ) * $producto -> precio;		
	}
	
	$compra_sucursal = new CompraSucursal();
	
	$compra_sucursal -> setSubtotal( $subtotal_compra );
	$compra_sucursal -> setIdSucursal( $sucursal );
	$compra_sucursal -> setIdUsuario( $_SESSION['userid'] ); 
	$compra_sucursal -> setPagado( 0 );
	$compra_sucursal -> setLiquidado( 0 );
	$compra_sucursal -> setTotal( $subtotal_compra );
	
	try{
		CompraSucursalDAO::save( $compra_sucursal );
	}catch(Exception $e){
		Logger::log("Error al ingresar compra sucursal" . $e);
		DAO::transRollback();	
		die( '{"success": false, "reason": "Error al ingresar compra sucursal"}' );
	}
	
	Logger::log("Agregado la compra sucursal!");
	
	//AQUI TERMINA LA TRANSACCION POR QUE PARA AGREGAR EL DETALLE COMPRA SUCURSAL DEBE DE ESTAR CREADA LA COMPRA A SUCURSAL
	
	DAO::transEnd();
	
	return $compra_sucursal -> getIdCompra();
	
}



function ingresarDetalleCompraSucursal( $data = null, $id_compra ){

	Logger::log("Iniciando proceso de creacion de detalle compra sucursal");

	if($data == null || $id_compra == null){
		Logger::log("ingresarDetalleCompraSucursal, error : recibi uno o mas objetos nulos");
		DAO::transRollback();
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	foreach( $data as $producto ){	
	
		if(!(		
			isset( $producto -> id_producto ) &&
			isset( $producto -> cantidad ) &&
			isset( $producto -> precio ) &&
			isset( $producto -> descuento ) &&			
			isset( $producto -> procesada ) &&
			isset( $producto -> id_compra )
		)){
			Logger::log("Faltan parametros para crear el nuevo detalle compra sucursal");
			die('{ "success": false, "reason" : "Faltan parametros." }');
		}
		
		$detalle_compra_sucursal = new DetalleCompraSucursal();
		
		$detalle_compra_sucursal -> setIdCompra( $id_compra );
		$detalle_compra_sucursal -> setIdProducto( $producto -> id_producto );
		$detalle_compra_sucursal -> setCantidad( $producto -> cantidad );
		$detalle_compra_sucursal -> setPrecio( $producto -> precio );
		$detalle_compra_sucursal -> setDescuento( $producto -> descuento );
		$detalle_compra_sucursal -> setProcesadas( $producto -> procesada );
		
	}
	
	DAO::transBegin();
		
	try{
		DetalleCompraSucursalDAO::save( $detalle_compra_sucursal );
	}catch(Exception $e){
		Logger::log("Error al agregar el detalle compra sucursal" . $e);
		
		//TODO: ELIMINAR LA COMPRA SUCURSAL Y DESHACER EL CAMBIO AL INVENTARIO MAESTRO EN CASO DE ENTRAR AQUI
		
		DAO::transRollback();	
		die( '{"success": false, "reason": "Error al ingresar el detalle compra sucursal" ' . $e . '}' );
	}
	
	Logger::log("Finalizado proceso de creacion de detalle compra sucursal!");
	
	return;

}



function ingresarAutorizacion( $data = null, $sucursal = null, $id_compra = null ){

	Logger::log("Iniciando proceso de ingreso de autorizacion en transito");

	if( $data == null || $sucursal == null || $id_compra == null){
		Logger::log("ingresarAutorizacionl, error : recibi uno o mas objetos nulos");
		DAO::transRollback();
		die('{"success": false , "reason": "Parametros invalidos." }');
	}
	
	$parametros = array();
	
	foreach( $data as $producto ){	
	
		if(!(
		
			isset( $producto -> id_producto ) &&
			isset( $producto -> cantidad ) &&
			isset( $producto -> precio ) &&
			isset( $producto -> descuento ) &&			
			isset( $producto -> procesada ) &&
			isset( $producto -> id_compra )
		)){
			Logger::log("Faltan parametros para crear el nuevo ingreso de autorizacion");
			DAO::transRollback();
			die('{ "success": false, "reason" : "Faltan parametros." }');
		}
		
		array_push( $parametros, array( 
			"id_compra" => $id_compra,
			"id_producto" => $producto -> id_producto
 		));	
		
	}
	
	
	$autorizacion = new Autorizacion();
	
	$autorizacion -> setIdUsuario( $_SESSION['userid'] );
	$autorizacion -> setIdSucursal( $sucursal );
	$autorizacion -> setEstado( 3 ); // en transito
	$autorizacion -> setParametros ( json_encode( $parametros ) );
	
	try{
		AutorizacionDAO::save( $autorizacion );
	}catch(Exception $e){
		Logger::log("Error al agregar la autorizacion de compra sucursal" . $e);
		DAO::transRollback();	
		die( '{"success": false, "reason": "Error al agregar la autorizacion de compra sucursal"}' );
	}

	DAO::transEnd();
	
	Logger::log("Proceso de venta a sucursal finalizado con exito!");
	
	printf('{"success": true}');
	
}



if(isset($args['action'])){
	switch($args['action']){

		case 1000://recibe el json para crear una compra  aproveedor

			if( !( isset( $args['data'] ) && $args['data'] != null ) )
			{
				Logger::log("No hay parametros para ingresar nueva compra a proveedor.");
				die('{"success": false , "reason": "Parametros invalidos." }');
			}
						
			nuevaCompraProveedor( $args['data'] );
			
		break;
		
		case 1001://modificar compra a proveedor (admin)
			//http://127.0.0.1/pos/www/proxy.php?action=1001&data={"id_compra_proveedor":"2","id_proveedor":"1","folio":"234","numero_de_viaje":"12","peso_recibido":"12200","arpillas":"340","peso_por_arpilla":"65","productor":"El%20fenix de Celaya","merma_por_arpilla":"5","total_origen":"17900"}
			//printf('{ "success": true, "datos": %s }',  json_encode( editarCompraProveedor( $args['data'] ) ) );
			editarCompraProveedor( $args['data'] );
		break;
	
        case 1002://regresa las compras realizadas por el admin
            printf('{ "success": true, "datos": %s }',  json_encode( listarComprasProveedor(  ) ) );
        break;

        case 1003://regresa el detalle de la compra
            printf('{ "success": true, "datos": %s }',  json_encode( detalleCompraProveedor( $args['id_compra_proveedor'] ) ) );
        break;
		
		case 1004://modificar flete
			editarCompraProveedorFlete( $args['data'] );
		break;
		
		case 1005;//crear compra sucursal
		
		/*
			{
				sucursal:1,
				productos:[
					{
						id_producto:1,
						procesada:false,
						cantidad:30,
						descuento:20,
						precio:12.4,
						id_compra:11.5
					}
				]
			}		
			
			{sucursal:2,productos:[{id_producto:3,procesada:false,cantidad:30,descuento:20,precio:12.4,id_compra:11.5}]}	
			
		*/
		
			if( !( isset( $args['data'] ) && $args['data'] != null ) )
			{
				Logger::log("No hay parametros para ingresar nueva compra a sucursal.");
				die('{"success": false , "reason": "Parametros invalidos." }');
			}						
			nuevaCompraSucursal( $args['data'] );
		break;		
		
	    default:
	        printf( '{ "success" : "false" }' );
	    break;

	}
}
//java -classpath .;gson-1.6.jar Test compras.test
//$_SESSION['userid']

 