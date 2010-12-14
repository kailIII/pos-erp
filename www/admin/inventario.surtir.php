<h1>Surtir una sucursal</h1>



<div class="content"> 
<h2>Seleccione la sucursal que desea surtir</h2><?php

/*
 * Nuevo Cliente
 */ 

	require_once("model/sucursal.dao.php");
	require_once("controller/clientes.controller.php");
	require_once("controller/sucursales.controller.php");
	require_once("controller/inventario.controller.php");	

?>

<script src="../frameworks/jquery/jquery-1.4.2.min.js" type="text/javascript" charset="utf-8"></script>
<script src="../frameworks/uniform/jquery.uniform.js" type="text/javascript" charset="utf-8"></script> 
<link rel="stylesheet" href="../frameworks/uniform/css/uniform.default.css" type="text/css" media="screen">

<script type="text/javascript" charset="utf-8">
	$(function(){
      $("input, select").uniform();
    });

    var currentSuc = null;

	function seleccionarSucursal(){


        if(currentSuc != null){
    		$("#actual" + currentSuc).slideUp();
        }

		$("#actual" + $('#sucursal').val()).slideDown();
		$("#InvMaestro").slideDown();
		$("#ASurtir").slideDown();
        currentSuc = $('#sucursal').val();		
	}

    carrito = [];

    function agregarProducto(pid){


        if($("#ASurtirItem"+pid).length == 0){
            $("#ASurtirTabla").append('<tr id="ASurtirItem'+pid+'"><td>'+pid+'</td><td><input type="text" id="ASurtirItemQty'+pid+'"></td></tr>');
            carrito.push( pid );
        }

    }


    function doSurtir(){
        //valida campos

        for(i = 0; i < carrito.length; i++ ){
             item = carrito[i];
            console.log("revisando " + item)
            if( isNaN($("#ASurtirItemQty"+item ).val()) || $("#ASurtirItemQty"+item ).val().length == 0){
                alert("La cantidad a surtir del producto " + item + " debe ser un numero." );
                return;
            }
        }

        //hacer ajaxaso

        //avisar resultado
    }

</script>




<form id="newClient">
<table border="0" cellspacing="5" cellpadding="5">
	<tr><td>Sucursal</td>
		<td>
			<select id="sucursal"> 
			<?php
			
				$sucursales = SucursalDAO::getAll();
				foreach( $sucursales as $suc ){
					echo "<option value='" . $suc->getIdSucursal() . "' >" .  $suc->getDescripcion()  . "</option>";
				}
			
			?>
	
	        </select>
		</td>
	</tr>
	<tr><td></td><td><input type="button" onClick="seleccionarSucursal()" value="Seleccionar"/> </td></tr>
</table>
</form>









<?php

//get sucursales
$sucursales = listarSucursales();

foreach( $sucursales as $sucursal ){
	
	print ("<div id='actual" . $sucursal["id_sucursal"] . "' style='display: none'>");
	print ("<h2>Inventario actual</h2><h3>" . $sucursal["descripcion"] . "</h3>");
	
	//obtener los clientes del controller de clientes
	$inventario = listarInventario( $sucursal["id_sucursal"] );

	//render the table
	$header = array( 
		"productoID" => "ID",
		"descripcion"=> "Descripcion",
		"precioVenta"=> "Precio Venta",
		"existenciasMinimas"=> "Minimas",
		"existencias"=> "Existencias",
		"medida"=> "Tipo",
		"precioIntersucursal"=> "Precio Intersucursal" );
		

	
	$tabla = new Tabla( $header, $inventario );
	$tabla->addColRender( "precioVenta", "moneyFormat" ); 
	$tabla->addColRender( "precioIntersucursal", "moneyFormat" ); 
	$tabla->render();
	printf("</div>");
}

?>







<div id="InvMaestro" style="display: none;">
<h2>Productos disponibles</h2><h3>Seleccione los productos que desee surtir a esta sucursal.</h3><?php

	//obtener los clientes del controller de clientes
	$inventario = listarInventarioMaestro( );

	//render the table
	$header = array( 
		"id_producto" => "ID",
		"descripcion"=> "Descripcion",
		"precio_intersucursal"=> "Precio Intersucursal",
		"costo"=> "Costo",
		"medida"=> "Medida");
		

	
	$tabla = new Tabla( $header, $inventario );
	$tabla->addColRender( "precioVenta", "moneyFormat" ); 
	$tabla->addColRender( "precioIntersucursal", "moneyFormat" ); 
    $tabla->addOnClick( "id_producto", "agregarProducto");
	$tabla->render();

?> 
</div>







<div id="ASurtir" style="display: none;">
<h2>Productos a surtir</h2><h3>Seleccione la cantidad del proucto que desea surtir.</h3>

<table id="ASurtirTabla">
    <tr><th>Descripcion</th><th>Cantidad</th></tr>

</table>

<input type="button" value="Surtir" onclick="doSurtir()">
</div>


