<?php


require_once('model/autorizacion.dao.php');
require_once('model/usuario.dao.php');
require_once('model/sucursal.dao.php');

$autorizacion = AutorizacionDAO::getByPK( $_REQUEST['id'] );
$autorizacionDetalles = json_decode( $autorizacion->getParametros() );

$usuario = UsuarioDAO::getByPK( $autorizacion->getIdUsuario() );
$sucursal = SucursalDAO::getByPK( $autorizacion->getIdSucursal() );

?>



<script src="../frameworks/jquery/jquery-1.4.2.min.js" type="text/javascript" charset="utf-8"></script>
<script src="../frameworks/uniform/jquery.uniform.min.js" type="text/javascript" charset="utf-8"></script> 
<link rel="stylesheet" href="../frameworks/uniform/css/uniform.default.css" type="text/css" media="screen">
<script>
function contestar(id, response){

    jQuery.ajaxSettings.traditional = true;

    $.ajax({
      url: "../proxy.php",
      data: { 
            action : 208, 
            id_autorizacion : id,
            reply : response ? "1" : "2"
       },
      cache: false,
      success: function(data){
            response = jQuery.parseJSON(data);
            if(response.success == false){
                window.location = "autorizaciones.php?action=pendientes&success=true&reason=" + response.reason;
                return;
            }
            reason = "Autorizacion respondida.";
            window.location = "autorizaciones.php?action=pendientes&success=true&reason=";
      }
    });
}


function surtirSuc(id, aut){
    window.location = "inventario.php?action=surtir&sid=" + id+"&aut="+aut;
}

$(function(){
  $("input, select").uniform();
});
</script>







<h1>Detalles de autorizacion</h1>
<h2>Detalles de la autorizacion</h2>

<table border="0" cellspacing="5" cellpadding="5">
	<tr><td><b>ID Autorizacion</b></td><td><?php    echo $autorizacion->getIdAutorizacion(); ?></td></tr>
	<tr><td><b>Usuario</b></td><td><?php            echo $usuario->getNombre(); ?></td></tr>
	<tr><td><b>Sucursal</b></td><td><?php           echo $sucursal->getDescripcion(); ?></td></tr>
	<tr><td><b>Fecha de peticion</b></td><td><?php  echo $autorizacion->getFechaPeticion(); ?></td></tr>
	<tr><td><b>Descripcion</b></td><td><?php        echo $autorizacionDetalles->descripcion; ?></td></tr>	

</table>


<?php
switch( $autorizacionDetalles->clave ){

    case "201": 
        //solicitud de autorizcion de gasto
        ?>
            <h2>Solicitud de gasto</h2>
            <table>
                <tr><td>Concepto</td><td><?php echo $autorizacionDetalles->concepto; ?></td></tr>
                <tr><td>Monto</td><td><?php echo $autorizacionDetalles->monto; ?></td></tr>
                <tr><td></td><td><input type=button value="Autorizar" onClick="contestar(<?php echo $_REQUEST['id'] ?>, true)"><input onClick="contestar(<?php echo $_REQUEST['id'] ?>, false)" type=button value="Rechazar"></td></tr>
            </table>
        <?php
        

    break;

    case "202": 
        //cambio de limite de credito
        ?>
            <h2>Solicitud de limite de credito</h2>
            <table>
                <tr><td>Cliente</td><td><?php echo $autorizacionDetalles->id_cliente; ?></td></tr>
                <tr><td>Cantidad</td><td><?php echo $autorizacionDetalles->cantidad; ?></td></tr>
                <tr><td></td><td><input type=button value="Autorizar" onClick="contestar(<?php echo $_REQUEST['id'] ?>, true)"><input onClick="contestar(<?php echo $_REQUEST['id'] ?>, false)" type=button value="Rechazar"></td></tr>
            </table>
        <?php
    break;

    case "203": 
        //devoluciones
        ?>
            <h2>Solicitud de devolucion</h2>
            <table>
                <tr><td>Venta</td><td><?php echo $autorizacionDetalles->id_venta; ?></td></tr>
                <tr><td>Producto</td><td><?php echo $autorizacionDetalles->id_producto; ?></td></tr>
                <tr><td>Cantidad</td><td><?php echo $autorizacionDetalles->cantidad; ?></td></tr>
                <tr><td></td><td><input type=button value="Autorizar" onClick="contestar(<?php echo $_REQUEST['id'] ?>, true)"><input onClick="contestar(<?php echo $_REQUEST['id'] ?>, false)" type=button value="Rechazar"></td></tr>
            </table>
        <?php


    break;

    case "204": 
        //cambio de precio
        ?>
            <h2>Solicitud de cambio de precio a producto</h2>
            <table>
                <tr><td>Cliente</td><td><?php echo $autorizacionDetalles->id_producto; ?></td></tr>
                <tr><td>Cantidad</td><td><?php echo $autorizacionDetalles->precio; ?></td></tr>
                <tr><td></td><td><input type=button value="Autorizar" onClick="contestar(<?php echo $_REQUEST['id'] ?>, true)"><input onClick="contestar(<?php echo $_REQUEST['id'] ?>, false)" type=button value="Rechazar"></td></tr>
            </table>
        <?php

    break;

    case "205": 
        //merma
        ?>
            <h2>Solicitud de merma</h2>
            <table>
                <tr><td>Cliente</td><td><?php echo $autorizacionDetalles->id_compra; ?></td></tr>
                <tr><td>Cantidad</td><td><?php echo $autorizacionDetalles->id_producto; ?></td></tr>
                <tr><td>Cantidad</td><td><?php echo $autorizacionDetalles->cantidad; ?></td></tr>
                <tr><td></td><td><input type=button value="Autorizar" onClick="contestar(<?php echo $_REQUEST['id'] ?>, true)"><input onClick="contestar(<?php echo $_REQUEST['id'] ?>, false)" type=button value="Rechazar"></td></tr>
            </table>
        <?php
    break;

    case "209": 
        //solicitud de surtir
        ?>
            <h2>Solicitud para surtir sucursal</h2>
            <table>
                <tr><td>Producto solicitado</td><td>Cantidad solicitada</td></tr>
                <?php
                foreach ($autorizacionDetalles->productos as $producto)
                {
                    ?><tr><td><?php echo $producto->id_producto; ?></td><td><?php echo $producto->cantidad; ?></td></tr><?php
                }
                ?>
                <tr><td></td><td></td></tr>
            </table>
            <input type=button value="Surtir sucursal" onclick="surtirSuc(<?php echo $autorizacion->getIdSucursal(); ?>, <?php    echo $autorizacion->getIdAutorizacion(); ?>)" >
        <?php

        
    break;


    default: 
}
?>







