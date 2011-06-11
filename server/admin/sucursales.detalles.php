<?php
require_once("controller/compras.controller.php");
require_once("controller/sucursales.controller.php");
require_once("controller/ventas.controller.php");
require_once("controller/personal.controller.php");
require_once("controller/efectivo.controller.php");
require_once("controller/inventario.controller.php");
require_once("controller/contabilidad.controller.php");

require_once('model/pagos_venta.dao.php');
require_once('model/corte.dao.php');


$sucursal = SucursalDAO::getByPK($_REQUEST['id']);
?>
<style type="text/css" media="screen">
    #map_canvas { 
        height: 200px;
        width: 400px;
    }
</style>

<script src="../frameworks/humblefinance/flotr/flotr.js" type="text/javascript" charset="utf-8"></script>
<script src="../frameworks/humblefinance/flotr/excanvas.js" type="text/javascript" charset="utf-8"></script>
<script src="../frameworks/humblefinance/flotr/canvastext.js" type="text/javascript" charset="utf-8"></script>
<script src="../frameworks/humblefinance/flotr/canvas2image.js" type="text/javascript" charset="utf-8"></script>
<script src="../frameworks/humblefinance/flotr/base64.js" type="text/javascript" charset="utf-8"></script>
<script type="text/javascript" charset="utf-8" src="../frameworks/humblefinance/humble/HumbleFinance.js"></script>
<link rel="stylesheet" href="../frameworks/humblefinance/humble/finance.css" type="text/css" media="screen" title="no title" charset="utf-8">


<h2>Detalles</h2>
<table style="width:100%" border="0" cellspacing="1" cellpadding="1">
    <tr><td><b>Descripcion</b></td><td>		<?php echo $sucursal->getDescripcion(); ?></td><td valign="top" align="right" rowspan=9><div  id="map_canvas"></div></td></tr>
    <tr><td><b>Direccion</b></td><td>		<?php echo $sucursal->getCalle() . " " . $sucursal->getNumeroExterior() . " " . $sucursal->getColonia() . " " . $sucursal->getMunicipio(); ?></td></tr>
    <tr><td><b>Apertura</b></td><td>		<?php echo toDate($sucursal->getFechaApertura()); ?></td></tr>
    <tr><td><b>Gerente</b></td><td>
<?php
$gerente = UsuarioDAO::getByPK($sucursal->getGerente());
if ($gerente === null) {
    echo "Esta sucursa no tiene gerente !";
} else {
    echo "<a href='gerentes.php?action=detalles&id=" . $sucursal->getGerente() . "'>";
    echo $gerente->getNombre();
    echo "</a>";
}
?>
        </td></tr>
    <tr><td><b>ID</b></td><td>				<?php echo $sucursal->getIdSucursal(); ?></td></tr>
    <tr><td><b>Letras factura</b></td><td>	<?php echo $sucursal->getLetrasFactura(); ?></td></tr>
    <tr><td><b>RFC</b></td><td>				<?php echo $sucursal->getRfc(); ?></td></tr>	
    <tr><td><b>Telefono</b></td><td>		<?php echo $sucursal->getTelefono(); ?></td></tr>	

    <tr><td colspan=2><input type=button value="Editar detalles" onclick="editar()"></td> </tr>
</table>

<?php

$balance = ContabilidadController::getBalancePorSucursal($_REQUEST['id']);



?>
<style>
.pr{
	font-size: 2.6em;
	font-weight: bold;
}
.ch {
	font-size: 1.8em;
	vertical-align: text-top;
}

.tiny-text{
	font-size: 11px;
	color:gray;
}
</style>

<table border=0>
	<tr>
		<td class="tiny-text">
			Balance actual:
		</td>
		<td class="tiny-text">
			Con respecto al 
			<?php 
				$date = toDate($balance[ sizeof($balance) -2 ]["fecha"]);
				$foo = explode( " ", $date );
				echo $foo[0];
			?> :
		</td>	
	</tr>
	<tr>
		<td>
			<?php echo "<div class='pr'>" . moneyFormat($balance[ sizeof($balance) -1 ]["value"]) . "</div>"; ?>
		</td>
		<td>
			<?php
			$change  = $balance[ sizeof($balance) -1 ]["value"] - $balance[ sizeof($balance) -2 ]["value"];
			$change_pct = ($change * 100) / $balance[ sizeof($balance) -2 ]["value"];
			$change_pct = round( $change_pct, 4 );
			if($change > 0){
				$change = moneyFormat( $change );
				echo "<div class='ch' style='color:green;'>+" . $change . " ( " . $change_pct ." % )</div>";
			}else{
				$change = moneyFormat( $change );				
				echo "<div class='ch' style='color:#A03;'>" . $change . " ( " . $change_pct ." % )</div>";
			}
			?>
		</td>		
	</tr>
	<tr>
		<td style="text-align:right">

		</td>

	</tr>
</table>

<?php






$ingreos_darios_g = new Reporte();
$ingreos_darios_g->agregarMuestra("Balance general", $balance, false  );
$ingreos_darios_g->fechaDeInicio( strtotime(  $sucursal->getFechaApertura()  ) );
$ingreos_darios_g->setEscalaEnY("pesos");
$ingreos_darios_g->graficar("Mapa");

?><br><hr><?php
$ingresos_diarios = ContabilidadController::getIngresosDiarios($_REQUEST['id']);
$gastos_diarios = ContabilidadController::getGastosDiarios($_REQUEST['id']);

$asdf = new Reporte();
$asdf->agregarMuestra("Ingresos", $ingresos_diarios, true  );
$asdf->agregarMuestra("Egresos", $gastos_diarios, true  );
$asdf->fechaDeInicio( strtotime(  $sucursal->getFechaApertura()  ) );
$asdf->setEscalaEnY("pesos");
$asdf->graficar("Flujo diario");

?><br>

<script type="text/javascript"> 

    jQuery("#MAIN_TITLE").html( "<?php echo $sucursal->getDescripcion(); ?>" )

    var drawMap = function ( result, status ) {
        if(result.length == 0){
            document.getElementById("map_canvas").innerHTML = "<div align='center'> Imposible localizar esta direccion. </div>"; 
            return;
        }

        var myLatlng = result[0].geometry.location;

        var myOptions = {
            zoom: 18,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            navigationControl : true
        };

        try{
            var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        }catch(e){
            document.getElementById("map_canvas").innerHTML = "<div align='center'> Imposible crear el mapa.</div>";
            return;
        }


        m = new google.maps.Marker({
            map: map,
            position: myLatlng
        });
    }


    function startMap(){

        GeocoderRequest = {
            address : "<?php echo $sucursal->getCalle() . " " . $sucursal->getNumeroExterior() . ", " . $sucursal->getColonia() . ", " . $sucursal->getMunicipio(); ?>, Mexico"
        };
        try{

            gc = new google.maps.Geocoder( );

            gc.geocode(GeocoderRequest,  drawMap);
		
        }catch(e){
            console.log(e)
        }


    }


    function mostrarDetalles( a ){
        window.location = "clientes.php?action=detalles&id=" + a;
    }
</script>


<script type="text/javascript" charset="utf-8">
    function mostrarDetallesVenta (vid){ window.location = "ventas.php?action=detalles&id=" + vid; }
    function editar(){ window.location = "sucursales.php?action=editar&sid=<?php echo $_REQUEST['id'] ?>"; }
</script>
<?php
/*
 * Buscar el numero de ventas de esta sucursal, versus las ventas de todas las sucursales en la empresa
 * 
 * */
if (VentasDAO::getByPK(1) != null) {
    $numeroDeVentasDiarias = new Reporte();
    $numeroDeVentasDiarias->agregarMuestra("Esta sucursal", VentasDAO::contarVentasPorDia($sucursal->getIdSucursal(), -1));
    $numeroDeVentasDiarias->agregarMuestra("Todas las sucursales", VentasDAO::contarVentasPorDia(null, -1));
    $numeroDeVentasDiarias->fechaDeInicio(strtotime(VentasDAO::getByPK(1)->getFecha()));
    $numeroDeVentasDiarias->setEscalaEnY("ventas");
    $numeroDeVentasDiarias->graficar("Ventas de esta sucursal");
}
?>

<h2><img src='../media/icons/basket_go_32.png'>&nbsp;Ventas en el ultimo dia</h2>

<?php
$date = new DateTime("now");
$date->setTime(0, 0, 1);

$v1 = new Ventas();
$v1->setFecha($date->format('Y-m-d H:i:s'));
$v1->setIdSucursal($_REQUEST['id']);

$date->setTime(23, 59, 59);
$v2 = new Ventas();
$v2->setFecha($date->format('Y-m-d H:i:s'));

$ventas = VentasDAO::byRange($v1, $v2);

//render the table
$header = array(
    "id_venta" => "Venta",
    //"id_sucursal"=>  "Sucursal",
    "id_cliente" => "Cliente",
    "tipo_venta" => "Tipo",
    "fecha" => "Hora",
    "subtotal" => "Subtotal",
    //"iva"=>  "IVA",
    "descuento" => "Descuento",
    "total" => "Total",
        //"pagado"=>  "Pagado" 
);

function getNombrecliente($id) {
    if ($id < 0) {
        return "Caja Comun";
    }
    return ClienteDAO::getByPK($id)->getRazonSocial();
}

function pDate($fecha) {

    $foo = toDate($fecha);
    $bar = explode(" ", $foo);
    return $bar[1] . " " . $bar[2];
}

function setTipocolor($tipo) {
    if ($tipo == "credito")
        return "<b>Credito</b>";
    return "Contado";
}

$tabla = new Tabla($header, $ventas);
$tabla->addColRender("subtotal", "moneyFormat");
$tabla->addColRender("saldo", "moneyFormat");
$tabla->addColRender("total", "moneyFormat");
$tabla->addColRender("pagado", "moneyFormat");
$tabla->addColRender("tipo_venta", "setTipoColor");
$tabla->addColRender("id_cliente", "getNombreCliente");
$tabla->addColRender("fecha", "pDate");
$tabla->addOnClick("id_venta", "mostrarDetallesVenta");
$tabla->addColRender("descuento", "percentFormat");
$tabla->addNoData("Esta sucursal no ha realizado ventas este dia.");
$tabla->render();
?>



<h2>Compras no saldadas de esta sucursal</h2><?php

function rSaldo($pagado) {
    return moneyFormat($pagado);
}

function toDateS($d) {
    $foo = toDate($d);
    $bar = explode(" ", $foo);
    return $bar[0];
}

$compras = comprasDeSucursalSinSaldar($_REQUEST['id'], false);
##########################################################################
?>
<script>
		var compras_no_saldadas = [];

		var store_para_compras =  new Ext.data.ArrayStore({
	        fields: [
					{ name : 'id_compra', 		type : 'int' },
					{ name : 'fecha', 			type : 'date', dateFormat: 'Y-m-d H:i:s' },
					{ name : 'subtotal', 		type : 'float' },
					{ name : 'id_usuario', 		type : 'int' },
					{ name : 'pagado', 			type : 'float' },
					{ name : 'liquidado', 		type : 'float' },
					{ name : 'total', 			type : 'float' }
				]
			});
			
<?php

foreach($compras as $c){
	?>
	compras_no_saldadas.push([
			<?php echo $c->getIdCompra(); ?>,
			"<?php echo $c->getFecha(); ?>",
			<?php echo $c->getSubtotal(); ?>,
			<?php echo $c->getIdUsuario(); ?>,
			<?php echo $c->getPagado(); ?>,
			<?php echo $c->getLiquidado(); ?>,
			<?php echo $c->getTotal(); ?>
		]);
	//compras_no_saldadas.push( <?php echo json_encode ( $c->asArray() ) ?> );
	<?php
}

?>





		Ext.onReady(function(){
		    Ext.QuickTips.init();
		    store_para_compras.loadData(compras_no_saldadas);
			// create the Grid
		    var tabla_compras_no_saldadas = new Ext.grid.GridPanel({
		        store: store_para_compras,
				header : false,
		        columns: [
			        {
		                header   : 'Fecha', 
		                width    : 75, 
		                sortable : true, 
		                renderer : Ext.util.Format.dateRenderer('d/m/Y'),  
		                dataIndex: 'fecha'
		            },
		            {
		                header   : 'ID Compra', 
		                width    : 75, 
		                sortable : true, 
		                dataIndex: 'id_compra'
		            },	
		            {
		                header   : 'Subtotal', 
		                width    : 180, 
						renderer : 'usMoney',
		                sortable : true, 
		                dataIndex: 'subtotal'
		            },
		            {
      					header   : 'Total', 
		                width    : 85, 
		                sortable : true, 
						renderer : 'usMoney',
		                dataIndex: 'total'
		            },
		            {
		                header   : 'Pagado', 
		                width    : 85, 
		                sortable : true, 
						renderer : 'usMoney',
		                dataIndex: 'pagado'
		            }],
			        stripeRows: false,
			        //autoExpandColumn: 'total',
			        height: 500,
					minHeight : 300,
			        width: "100%",
			        stateful: false,
			        stateId: 'sucursales_compras_no_saldadas_cookie',
					listeners : {
						"rowclick" : function (grid, rowIndex, e){
							
							var datos = grid.getStore().getAt( rowIndex );

							
        					window.location = "inventario.php?action=detalleCompraSucursal&cid=" + datos.get("id_compra" );
						}
					}

			    });
			tabla_compras_no_saldadas.render("tabla_compras_no_saldadas_holder");
		});


</script>

<div id="tabla_compras_no_saldadas_holder" style="padding: 5px;">
</div>

<?php
##########################################################################
?>



<h2><img src='../media/icons/users_business_32.png'>&nbsp;Personal</h2><?php
$empleados = listarEmpleados($_REQUEST['id']);


switch (POS_PERIODICIDAD_SALARIO) {
    case POS_SEMANA : $periodicidad = "semanal";
        break;
    case POS_MES : $periodicidad = "menusal";
        break;
}

$header = array(
    "id_usuario" => "ID",
    "nombre" => "Nombre",
    "puesto" => "Puesto",
    "RFC" => "RFC",
    //"direccion" => "Direccion",
    //"telefono" => "Telefono",
    "fecha_inicio" => "Inicio",
    "salario" => "Salario " . $periodicidad);


$tabla = new Tabla($header, $empleados);
$tabla->addColRender("salario", "moneyFormat");
$tabla->addColRender("fecha_inicio", "toDateS");
$tabla->addNoData("Esta sucursal no cuenta con nigun empleado.");
$tabla->addOnClick("id_usuario", "(function(id){window.location='personal.php?action=detalles&uid=' + id;})");
$tabla->render();


$totalEmpleados = 0;

foreach ($empleados as $e) {
    $totalEmpleados += $e['salario'];
}

$salarioGerente = 0;
if ($gerente !== null)
    $salarioGerente = $gerente->getSalario();
?>
<div align="right">
    <table>
        <tr><td>Salarios empleados</td><td><b><?php echo moneyFormat($totalEmpleados); ?></b></td></tr>
        <tr><td>Salario gerente</td><td><b><?php echo moneyFormat($salarioGerente); ?></b></td></tr>
        <tr><td>Total</td><td><b><?php echo moneyFormat($totalEmpleados + $salarioGerente); ?></b></td></tr>
    </table>
</div>










<h2><img src='../media/icons/window_app_list_chart_32.png'>&nbsp;Inventario actual</h2><?php
//obtener los clientes del controller de clientes
$inventario = listarInventario($_REQUEST['id']);

function colorExistencias($n) {
    //buscar en el arreglo
    if ($n < 10) {
        return "<div style='color:red;'>" . $n . "</div>";
    }

    return $n;
}

function toUnit($e, $row) {
    //$row["tratamiento"]
    switch ($row["medida"]) {
        case "kilogramo" : $escala = "Kgs";
            break;
        case "pieza" : $escala = "Pzas";
            break;
    }

    return "<b>" . number_format($e / 60, 2) . "</b>Arp. / <b>" . number_format($e, 2) . "</b>" . $escala;
}

function toUnitProc($e, $row) {
    if ($row["tratamiento"] == null) {
        return "<i>NA</i>";
    }

    switch ($row["medida"]) {
        case "kilogramo" : $escala = "Kgs";
            break;
        case "pieza" : $escala = "Pzas";
            break;
    }

    return "<b>" . number_format($e / 60, 2) . "</b>Arp. / <b>" . number_format($e, 2) . "</b>" . $escala;
}

//render the table
$header = array(
    "productoID" => "ID",
    "descripcion" => "Descripcion",
    "precioVenta" => "Precio sugerido",
    "existenciasOriginales" => "Existencias Originales",
    "existenciasProcesadas" => "Existencias Procesadas");



$tabla = new Tabla($header, $inventario);
$tabla->addColRender("precioVenta", "moneyFormat");
$tabla->addColRender("existenciasOriginales", "toUnit");
$tabla->addColRender("existenciasProcesadas", "toUnitProc");
$tabla->addNoData("Esta sucursal no cuenta con ningun producto en su inventario.");
$tabla->render();
?>










<h2><img src='../media/icons/email_forward_32.png'>&nbsp;Autorizaciones pendientes</h2><?php
$autorizacion = new Autorizacion();
$autorizacion->setIdSucursal($_REQUEST['id']);
$autorizacion->setEstado("0");
$autorizaciones = AutorizacionDAO::search($autorizacion);


$header = array(
    "id_autorizacion" => "ID",
    "fecha_peticion" => "Fecha",
    "id_usuario" => "Usuario que realizo la peticion",
    "parametros" => "Descripcion");

function renderParam($json) {
    $obj = json_decode($json);
    return $obj->descripcion;
}

function renderUsuario($uid) {
    $usuario = UsuarioDAO::getByPK($uid);
    return $usuario->getNombre();
}

$tabla = new Tabla($header, $autorizaciones);
$tabla->addColRender("parametros", "renderParam");
$tabla->addColRender("id_usuario", "renderUsuario");
$tabla->addOnClick("id_autorizacion", "detalle");
$tabla->addNoData("No hay autorizaciones pendientes");
$tabla->render();
?>









<h2><img src='../media/icons/user_add_32.png'>&nbsp;Clientes que se registraron en esta sucursal</h2><?php
$foo = new Cliente();
$foo->setActivo(1);
$foo->setIdCliente(1);
$foo->setIdSucursal($_REQUEST['id']);

$bar = new Cliente();
$bar->setIdCliente(999);

$clientes = ClienteDAO::byRange($foo, $bar);

//render the table
$header = array("razon_social" => "Razon Social", "rfc" => "RFC", /* "direccion" => "Direccion", */ "municipio" => "Municipio");
$tabla = new Tabla($header, $clientes);
$tabla->addOnClick("id_cliente", "mostrarDetalles");
$tabla->addNoData("Ningun cliente se ha registrado en esta sucursal.");
$tabla->render();
?>





<h2><img src='../media/icons/window_app_list_chart_32.png'>&nbsp;Flujo de efectivo desde el ultimo corte</h2><?php
$flujo = array();


/* * *****************************************
 * Fecha desde el ultimo corte
 * ****************************************** */
$corte = new Corte();
$corte->setIdSucursal($_REQUEST['id']);

$cortes = CorteDAO::getAll(1, 1, 'fecha', 'desc');



if (sizeof($cortes) == 0) {
    echo "<div align=center>No se han hecho cortes en esta sucursal. Mostrando flujo desde la apertura de sucursal.</div><br>";

    $fecha = $sucursal->getFechaApertura();
} else {

    $corte = $cortes[0];
    echo "Fecha de ultimo corte: <b>" . $corte->getFecha() . "</b><br>";
    $fecha = $corte->getFecha();
}


$now = new DateTime("now");
$hoy = $now->format("Y-m-d H:i:s");

/* * *****************************************
 * Buscar los gastos
 * Buscar todos los gastos desde la fecha inicial
 * **************************************** */
$foo = new Gastos();
$foo->setFecha($fecha);
$foo->setIdSucursal($_REQUEST['id']);

$bar = new Gastos();
$bar->setFecha($hoy);

$gastos = GastosDAO::byRange($foo, $bar);


foreach ($gastos as $g) {
    array_push($flujo, array(
        "tipo" => "gasto",
        "concepto" => $g->getConcepto(),
        "monto" => $g->getMonto() * -1,
        "usuario" => $g->getIdUsuario(),
        "fecha" => $g->getFecha()
    ));
}


/* ******************************************
 * Ingresos
 * Buscar todos los ingresos desde la fecha inicial
 * ****************************************** */
$foo = new Ingresos();
$foo->setFecha($fecha);
$foo->setIdSucursal($_REQUEST['id']);

$bar = new Ingresos();
$bar->setFecha($hoy);

$ingresos = IngresosDAO::byRange($foo, $bar);

foreach ($ingresos as $i) {
    array_push($flujo, array(
        "tipo" => "ingreso",
        "concepto" => $i->getConcepto(),
        "monto" => $i->getMonto(),
        "usuario" => $i->getIdUsuario(),
        "fecha" => $i->getFecha()
    ));
}


/* * *****************************************
 * Ventas
 * Buscar todas la ventas a contado para esta sucursal desde esa fecha
 * ****************************************** */
$foo = new Ventas();
$foo->setFecha($fecha);
$foo->setIdSucursal($_REQUEST['id']);
$foo->setTipoVenta('contado');

$bar = new Ventas();
$bar->setFecha($hoy);

$ventas = VentasDAO::byRange($foo, $bar);


//las ventas
foreach ($ventas as $i) {
    array_push($flujo, array(
        "tipo" => "venta",
        "concepto" => "<a href='ventas.php?action=detalles&id=" . $i->getIdVenta() . "'>Venta de contado</a>",
        "monto" => $i->getPagado(),
        "usuario" => $i->getIdUsuario(),
        "fecha" => $i->getFecha()
    ));
}



/* * *****************************************
 * Abonos
 * Buscar todos los abonos para esta sucursal que se hicierond espues de esa fecha
 * ****************************************** */
$query = new PagosVenta();
$query->setIdSucursal($_REQUEST["id"]);
$query->setFecha($fecha);

$queryE = new PagosVenta();
$queryE->setFecha($hoy);


$results = PagosVentaDAO::byRange($query, $queryE);

foreach ($results as $pago) {
    array_push($flujo, array(
        "tipo" => "abono",
        "concepto" => "<a href='ventas.php?action=detalles&id=" . $pago->getIdVenta() . "'>Abono a venta</a>",
        "monto" => $pago->getMonto(),
        "usuario" => $pago->getIdUsuario(),
        "fecha" => $pago->getFecha()
    ));
}


/* * *****************************************
 * DIBUJAR LA GRAFICA
 * ****************************************** */
$header = array(
    "tipo" => "Tipo",
    "concepto" => "Concepto",
    "usuario" => "Usuario",
    "fecha" => "Fecha",
    "monto" => "Monto");

function renderMonto($monto) {
    if ($monto < 0)
        return "<div style='color:red;'>" . moneyFormat($monto) . "</div>";

    return "<div style='color:green;'>" . moneyFormat($monto) . "</div>";
}

function cmpFecha($a, $b) {
    if ($a["fecha"] == $b["fecha"]) {
        return 0;
    }
    return ($a["fecha"] < $b["fecha"]) ? -1 : 1;
}

usort($flujo, "cmpFecha");

$tabla = new Tabla($header, $flujo);
$tabla->addColRender("usuario", "renderUsuario");
$tabla->addColRender("fecha", "toDate");
$tabla->addColRender("monto", "renderMonto");
$tabla->addNoData("No hay operaciones.");
$tabla->render();

$enCaja = 0;

foreach ($flujo as $f) {
    $enCaja += $f['monto'];
}


echo "<div align=right><h3>Total en caja: " . moneyFormat($enCaja) . "</h3></div>";
?>

<h4><input type="button" 
	value= "Realizar corte" 
	onClick="window.location = 'sucursales.php?action=realizarCorte&id_sucursal=<?php echo $sucursal->getIdSucursal(); ?>';"></h4>

<?php
if (POS_ENABLE_GMAPS) {
    ?><script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script><?php
}
?>