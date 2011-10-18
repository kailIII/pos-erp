
<DIV id="header-content">
	<P class="logo"><A href="index.php">caffeina</A></P>
	
	<UL class="nav">
		<LI class="drop">
			<A href="clientes.php?action=lista">CLIENTES</A>

			<UL class="nav sub" >
				<LI><A href="clientes.php?action=lista">Lista de clientes</A></LI>
				<LI class="last"><A href="clientes.php?action=nuevo">Nuevo Cliente</A></LI>
			</UL>	

		</LI>
		
		<?php
			if( POS_MULTI_SUCURSAL ){
				
				?>
				<LI class="drop">
					<A >SUCURSALES</A>
					<UL  class="nav sub" >
						<LI><A href="sucursales.php?action=lista">Sucursales</A></LI>
						<li><a href="inventario.php?action=surtir">Surtir Sucursal</a></li>
						<LI><A href="sucursales.php?action=abrir">Nueva sucursal</A></LI> 
						<LI><A href="sucursales.php?action=ventas">Ventas a sucursales</A></LI>
						<LI><A href="gerentes.php?action=lista">Gerentes</A></LI>
						<!-- 				<LI><A href="gerentes.php?action=asignar">Asignar gerencias</A></LI>				-->
						<!--				<LI class="last"><A href="gerentes.php?action=nuevo">Nuevo gerente</A></LI> 		-->
					</UL>			
				</LI>
				<?php
			}else{
				?>
				<LI class="drop">
					<A href="sucursales.php?action=detalles&id=0">SUCURSAL</A>
					<UL  class="nav sub" >
						<LI><A href="sucursales.php?action=detalles&id=0">Sucursal</A></LI>
						<LI><A href="sucursales.php?action=abrir">Nueva sucursal</A></LI> 
						<LI><A href="gerentes.php?action=lista">Gerentes</A></LI>
						<!-- 				<LI><A href="gerentes.php?action=asignar">Asignar gerencias</A></LI>				-->
						<!--				<LI class="last"><A href="gerentes.php?action=nuevo">Nuevo gerente</A></LI> 		-->
					</UL>			
				</LI>
				<?php
			}
		?>
		
		
		<?php
			if( POS_COMPRA_A_CLIENTES ){

				?>
				<LI class="drop">
					<A >COMPRAS</A>
					<UL  class="nav sub" >
						<LI><A href="compras.php?action=comprar_cliente">Comprar a cliente</A></LI>
						<li><a href="compras.php?action=lista">Lista de compras</a></li>
					</UL>			
				</LI>
				<?php

			}
		?>

		
		<LI class="drop">
			<A >VENTAS</A>
				<ul class="nav sub">
					<?php if(POS_MULTI_SUCURSAL){ ?>
						<li >
						  <a  href="ventas.php?action=vender">Realizar venta</a>
						</li>
					<?php } else { ?>
						<li >
						  <a  href="ventas.php?action=vender_simple">Realizar venta</a>
						</li>
					<?php }  ?>						

				<li>
				  <a  href="ventas.php?action=lista">Ver ventas</a>
				</li>
				<li>
				  <a  href="ventas.php?action=porProducto">Ventas por producto</a>
				</li>

				<!--
				<li>
				  <a  href="ventas.php?action=proyecciones">Historial y Proyecciones</a>
				</li>
				-->
			  </ul>
		</LI>
		
		<?php if(POS_MULTI_SUCURSAL) {?>
		<LI class="drop">
			<A href="autorizaciones.php?action=historial">AUTORIZACIONES</A>
			<!--
			<ul class="nav sub">
		    <li >
		      <a href="autorizaciones.php?action=pendientes" >Pendientes</a>
		    </li>
		    <li>
		      <a href="autorizaciones.php?action=historial" >Todas las autorizaciones</a>
		    </li>
		  </ul>
		-->
		</LI>
		<?php } ?>
		
		
		<?php if(POS_MODULO_CONTABILIDAD) {?>
		<LI class="drop">
			<A href="contabilidad.php?action=balance">CONTABILIDAD</A>
		  <ul class="nav sub">
			<li >
			  <a href="contabilidad.php?action=balance">Balance</a>
			</li>
			<li >
			  <a href="contabilidad.php?action=egresos">Egresos</a>
			</li>
			<li >
			  <a href="contabilidad.php?action=ingresos">Ingresos</a>
			</li>
		  </ul>
		</LI>
		<?php } ?>		
		
		<LI class="drop">
			<A >PROVEEDORES</A>
		  <ul class="nav sub">
			<li >
			  <a href="proveedor.php?action=lista">Lista de proveedores</a>
			</li>
<!--			<li>
			  <a href="proveedor.php?action=nuevo">Nuevo proveedor</a>
			</li>
-->
			<li>
			  <a href="proveedor.php?action=abastecer">Abastecerse de proveedor</a>
			</li>
			<li>
			  <a href="proveedor.php?action=compras_lista">Compras a proveedor</a>
			</li>			

		  </ul>			
		</LI>
		
		
		<LI class="drop">
			<A  href="inventario.php?action=maestro">INVENTARIO</A>
			  <ul class="nav sub">
				<li >
				  <a href="inventario.php?action=maestro">Inventario maestro</a>
				</li>

				<?php if(POS_MULTI_SUCURSAL){ ?>
				<li >
				  <a href="inventario.php?action=lista">Inventario de sucursales</a>
				</li>
				<?php } ?>


				<li>
				  <a href="inventario.php?action=nuevo">Nuevo Producto</a>
				</li>
				<?php if(POS_MULTI_SUCURSAL){ ?>
					<li>
					  <a href="inventario.php?action=transit">En transito</a>
					</li>
				<?php } ?>

			  </ul>
		</LI>
					
		<LI class="drop"><A href="../proxy.php?action=2002">SALIR</A></LI>
	</UL>
	

</DIV> <!-- header-content -->

<script>
var __current = [];
	
	function toolbar(){
		for( a = 0; a < jQuery(".nav.sub").length; a++){ jQuery(jQuery(".nav.sub")[a]).hide(); }
		
		jQuery("#header-content").hover(
			function(){
				if(__current) {
					__current.hide();
				}
			},
			function(){
			
			});
		
		jQuery(".nav>.drop>a").hover( 
			function(e){ 

				//in
				while(__current.length > 0) {
					__current.pop().hide();
				}
				
				__currentP = jQuery(this).next();
				__currentP.css("left", "0px");
				__currentP.show();
				__current.push( __currentP );

			},
			function(e){
				//out
			});
	}
	toolbar();

</script>


    
